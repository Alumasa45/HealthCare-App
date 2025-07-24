"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const store = require("@tanstack/store");
const utils = require("./utils.cjs");
const standardSchemaValidator = require("./standardSchemaValidator.cjs");
const metaHelper = require("./metaHelper.cjs");
function getDefaultFormState(defaultState) {
  return {
    values: defaultState.values ?? {},
    errorMap: defaultState.errorMap ?? {},
    fieldMetaBase: defaultState.fieldMetaBase ?? {},
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    isSubmitSuccessful: defaultState.isSubmitSuccessful ?? false,
    validationMetaMap: defaultState.validationMetaMap ?? {
      onChange: void 0,
      onBlur: void 0,
      onSubmit: void 0,
      onMount: void 0,
      onServer: void 0
    }
  };
}
class FormApi {
  /**
   * Constructs a new `FormApi` instance with the given form options.
   */
  constructor(opts) {
    var _a;
    this.options = {};
    this.fieldInfo = {};
    this.prevTransformArray = [];
    this.mount = () => {
      var _a2, _b;
      const cleanupFieldMetaDerived = this.fieldMetaDerived.mount();
      const cleanupStoreDerived = this.store.mount();
      const cleanup = () => {
        cleanupFieldMetaDerived();
        cleanupStoreDerived();
      };
      (_b = (_a2 = this.options.listeners) == null ? void 0 : _a2.onMount) == null ? void 0 : _b.call(_a2, { formApi: this });
      const { onMount } = this.options.validators || {};
      if (!onMount) return cleanup;
      this.validateSync("mount");
      return cleanup;
    };
    this.update = (options) => {
      var _a2, _b;
      if (!options) return;
      const oldOptions = this.options;
      this.options = options;
      const shouldUpdateReeval = !!((_b = (_a2 = options.transform) == null ? void 0 : _a2.deps) == null ? void 0 : _b.some(
        (val, i) => val !== this.prevTransformArray[i]
      ));
      const shouldUpdateValues = options.defaultValues && !utils.evaluate(options.defaultValues, oldOptions.defaultValues) && !this.state.isTouched;
      const shouldUpdateState = !utils.evaluate(options.defaultState, oldOptions.defaultState) && !this.state.isTouched;
      if (!shouldUpdateValues && !shouldUpdateState && !shouldUpdateReeval) return;
      store.batch(() => {
        this.baseStore.setState(
          () => getDefaultFormState(
            Object.assign(
              {},
              this.state,
              shouldUpdateState ? options.defaultState : {},
              shouldUpdateValues ? {
                values: options.defaultValues
              } : {},
              shouldUpdateReeval ? { _force_re_eval: !this.state._force_re_eval } : {}
            )
          )
        );
      });
    };
    this.reset = (values, opts2) => {
      const { fieldMeta: currentFieldMeta } = this.state;
      const fieldMetaBase = this.resetFieldMeta(currentFieldMeta);
      if (values && !(opts2 == null ? void 0 : opts2.keepDefaultValues)) {
        this.options = {
          ...this.options,
          defaultValues: values
        };
      }
      this.baseStore.setState(
        () => {
          var _a2;
          return getDefaultFormState({
            ...this.options.defaultState,
            values: values ?? this.options.defaultValues ?? ((_a2 = this.options.defaultState) == null ? void 0 : _a2.values),
            fieldMetaBase
          });
        }
      );
    };
    this.validateAllFields = async (cause) => {
      const fieldValidationPromises = [];
      store.batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            if (!field.instance) return;
            const fieldInstance = field.instance;
            fieldValidationPromises.push(
              // Remember, `validate` is either a sync operation or a promise
              Promise.resolve().then(
                () => fieldInstance.validate(cause, { skipFormValidation: true })
              )
            );
            if (!field.instance.state.meta.isTouched) {
              field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
            }
          }
        );
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateArrayFieldsStartingFrom = async (field, index, cause) => {
      const currentValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(currentValue) ? Math.max(currentValue.length - 1, 0) : null;
      const fieldKeysToValidate = [`${field}[${index}]`];
      for (let i = index + 1; i <= (lastIndex ?? 0); i++) {
        fieldKeysToValidate.push(`${field}[${i}]`);
      }
      const fieldsToValidate = Object.keys(this.fieldInfo).filter(
        (fieldKey) => fieldKeysToValidate.some((key) => fieldKey.startsWith(key))
      );
      const fieldValidationPromises = [];
      store.batch(() => {
        fieldsToValidate.forEach((nestedField) => {
          fieldValidationPromises.push(
            Promise.resolve().then(() => this.validateField(nestedField, cause))
          );
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateField = (field, cause) => {
      var _a2;
      const fieldInstance = (_a2 = this.fieldInfo[field]) == null ? void 0 : _a2.instance;
      if (!fieldInstance) return [];
      if (!fieldInstance.state.meta.isTouched) {
        fieldInstance.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      return fieldInstance.validate(cause);
    };
    this.validateSync = (cause) => {
      const validates = utils.getSyncValidatorArray(cause, this.options);
      let hasErrored = false;
      const currentValidationErrorMap = {};
      store.batch(() => {
        var _a2, _b;
        for (const validateObj of validates) {
          if (!validateObj.validate) continue;
          const rawError = this.runValidator({
            validate: validateObj.validate,
            value: {
              value: this.state.values,
              formApi: this,
              validationSource: "form"
            },
            type: "validate"
          });
          const { formError, fieldErrors } = normalizeError(rawError);
          const errorMapKey = getErrorMapKey(validateObj.cause);
          for (const field of Object.keys(
            this.state.fieldMeta
          )) {
            const fieldMeta = this.getFieldMeta(field);
            if (!fieldMeta) continue;
            const {
              errorMap: currentErrorMap,
              errorSourceMap: currentErrorMapSource
            } = fieldMeta;
            const newFormValidatorError = fieldErrors == null ? void 0 : fieldErrors[field];
            const { newErrorValue, newSource } = utils.determineFormLevelErrorSourceAndValue({
              newFormValidatorError,
              isPreviousErrorFromFormValidator: (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                (currentErrorMapSource == null ? void 0 : currentErrorMapSource[errorMapKey]) === "form"
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              previousErrorValue: currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]
            });
            if (newSource === "form") {
              currentValidationErrorMap[field] = {
                ...currentValidationErrorMap[field],
                [errorMapKey]: newFormValidatorError
              };
            }
            if (
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              (currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]) !== newErrorValue
            ) {
              this.setFieldMeta(field, (prev) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              }));
            }
          }
          if (((_a2 = this.state.errorMap) == null ? void 0 : _a2[errorMapKey]) !== formError) {
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
          }
          if (formError || fieldErrors) {
            hasErrored = true;
          }
        }
        const submitErrKey = getErrorMapKey("submit");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          ((_b = this.state.errorMap) == null ? void 0 : _b[submitErrKey]) && cause !== "submit" && !hasErrored
        ) {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [submitErrKey]: void 0
            }
          }));
        }
      });
      return { hasErrored, fieldsErrorMap: currentValidationErrorMap };
    };
    this.validateAsync = async (cause) => {
      const validates = utils.getAsyncValidatorArray(cause, this.options);
      if (!this.state.isFormValidating) {
        this.baseStore.setState((prev) => ({ ...prev, isFormValidating: true }));
      }
      const promises = [];
      let fieldErrorsFromFormValidators;
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        const key = getErrorMapKey(validateObj.cause);
        const fieldValidatorMeta = this.state.validationMetaMap[key];
        fieldValidatorMeta == null ? void 0 : fieldValidatorMeta.lastAbortController.abort();
        const controller = new AbortController();
        this.state.validationMetaMap[key] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                setTimeout(async () => {
                  if (controller.signal.aborted) return rawResolve(void 0);
                  try {
                    rawResolve(
                      await this.runValidator({
                        validate: validateObj.validate,
                        value: {
                          value: this.state.values,
                          formApi: this,
                          validationSource: "form",
                          signal: controller.signal
                        },
                        type: "validateAsync"
                      })
                    );
                  } catch (e) {
                    rawReject(e);
                  }
                }, validateObj.debounceMs);
              });
            } catch (e) {
              rawError = e;
            }
            const { formError, fieldErrors: fieldErrorsFromNormalizeError } = normalizeError(rawError);
            if (fieldErrorsFromNormalizeError) {
              fieldErrorsFromFormValidators = fieldErrorsFromFormValidators ? {
                ...fieldErrorsFromFormValidators,
                ...fieldErrorsFromNormalizeError
              } : fieldErrorsFromNormalizeError;
            }
            const errorMapKey = getErrorMapKey(validateObj.cause);
            for (const field of Object.keys(
              this.state.fieldMeta
            )) {
              const fieldMeta = this.getFieldMeta(field);
              if (!fieldMeta) continue;
              const {
                errorMap: currentErrorMap,
                errorSourceMap: currentErrorMapSource
              } = fieldMeta;
              const newFormValidatorError = fieldErrorsFromFormValidators == null ? void 0 : fieldErrorsFromFormValidators[field];
              const { newErrorValue, newSource } = utils.determineFormLevelErrorSourceAndValue({
                newFormValidatorError,
                isPreviousErrorFromFormValidator: (
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  (currentErrorMapSource == null ? void 0 : currentErrorMapSource[errorMapKey]) === "form"
                ),
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                previousErrorValue: currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]
              });
              if (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                (currentErrorMap == null ? void 0 : currentErrorMap[errorMapKey]) !== newErrorValue
              ) {
                this.setFieldMeta(field, (prev) => ({
                  ...prev,
                  errorMap: {
                    ...prev.errorMap,
                    [errorMapKey]: newErrorValue
                  },
                  errorSourceMap: {
                    ...prev.errorSourceMap,
                    [errorMapKey]: newSource
                  }
                }));
              }
            }
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
            resolve(
              fieldErrorsFromFormValidators ? { fieldErrors: fieldErrorsFromFormValidators, errorMapKey } : void 0
            );
          })
        );
      }
      let results = [];
      const fieldsErrorMap = {};
      if (promises.length) {
        results = await Promise.all(promises);
        for (const fieldValidationResult of results) {
          if (fieldValidationResult == null ? void 0 : fieldValidationResult.fieldErrors) {
            const { errorMapKey } = fieldValidationResult;
            for (const [field, fieldError] of Object.entries(
              fieldValidationResult.fieldErrors
            )) {
              const oldErrorMap = fieldsErrorMap[field] || {};
              const newErrorMap = {
                ...oldErrorMap,
                [errorMapKey]: fieldError
              };
              fieldsErrorMap[field] = newErrorMap;
            }
          }
        }
      }
      this.baseStore.setState((prev) => ({
        ...prev,
        isFormValidating: false
      }));
      return fieldsErrorMap;
    };
    this.validate = (cause) => {
      const { hasErrored, fieldsErrorMap } = this.validateSync(cause);
      if (hasErrored && !this.options.asyncAlways) {
        return fieldsErrorMap;
      }
      return this.validateAsync(cause);
    };
    this.getFieldValue = (field) => utils.getBy(this.state.values, field);
    this.getFieldMeta = (field) => {
      return this.state.fieldMeta[field];
    };
    this.getFieldInfo = (field) => {
      var _a2;
      return (_a2 = this.fieldInfo)[field] || (_a2[field] = {
        instance: null,
        validationMetaMap: {
          onChange: void 0,
          onBlur: void 0,
          onSubmit: void 0,
          onMount: void 0,
          onServer: void 0
        }
      });
    };
    this.setFieldMeta = (field, updater) => {
      this.baseStore.setState((prev) => {
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: utils.functionalUpdate(
              updater,
              prev.fieldMetaBase[field]
            )
          }
        };
      });
    };
    this.resetFieldMeta = (fieldMeta) => {
      return Object.keys(fieldMeta).reduce(
        (acc, key) => {
          const fieldKey = key;
          acc[fieldKey] = metaHelper.defaultFieldMeta;
          return acc;
        },
        {}
      );
    };
    this.setFieldValue = (field, updater, opts2) => {
      const dontUpdateMeta = (opts2 == null ? void 0 : opts2.dontUpdateMeta) ?? false;
      store.batch(() => {
        if (!dontUpdateMeta) {
          this.setFieldMeta(field, (prev) => ({
            ...prev,
            isTouched: true,
            isDirty: true,
            errorMap: {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              ...prev == null ? void 0 : prev.errorMap,
              onMount: void 0
            }
          }));
        }
        this.baseStore.setState((prev) => {
          return {
            ...prev,
            values: utils.setBy(prev.values, field, updater)
          };
        });
      });
    };
    this.deleteField = (field) => {
      const subFieldsToDelete = Object.keys(this.fieldInfo).filter((f) => {
        const fieldStr = field.toString();
        return f !== fieldStr && f.startsWith(fieldStr);
      });
      const fieldsToDelete = [...subFieldsToDelete, field];
      this.baseStore.setState((prev) => {
        const newState = { ...prev };
        fieldsToDelete.forEach((f) => {
          newState.values = utils.deleteBy(newState.values, f);
          delete this.fieldInfo[f];
          delete newState.fieldMetaBase[f];
        });
        return newState;
      });
    };
    this.pushFieldValue = (field, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => [...Array.isArray(prev) ? prev : [], value],
        opts2
      );
      this.validateField(field, "change");
    };
    this.insertFieldValue = async (field, index, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          return [
            ...prev.slice(0, index),
            value,
            ...prev.slice(index)
          ];
        },
        opts2
      );
      await this.validateField(field, "change");
      metaHelper.metaHelper(this).handleArrayFieldMetaShift(field, index, "insert");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.replaceFieldValue = async (field, index, value, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          return prev.map(
            (d, i) => i === index ? value : d
          );
        },
        opts2
      );
      await this.validateField(field, "change");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.removeFieldValue = async (field, index, opts2) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(
        field,
        (prev) => {
          return prev.filter(
            (_d, i) => i !== index
          );
        },
        opts2
      );
      metaHelper.metaHelper(this).handleArrayFieldMetaShift(field, index, "remove");
      if (lastIndex !== null) {
        const start = `${field}[${lastIndex}]`;
        this.deleteField(start);
      }
      await this.validateField(field, "change");
      await this.validateArrayFieldsStartingFrom(field, index, "change");
    };
    this.swapFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          const prev1 = prev[index1];
          const prev2 = prev[index2];
          return utils.setBy(utils.setBy(prev, `${index1}`, prev2), `${index2}`, prev1);
        },
        opts2
      );
      metaHelper.metaHelper(this).handleArrayFieldMetaShift(field, index1, "swap", index2);
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.moveFieldValues = (field, index1, index2, opts2) => {
      this.setFieldValue(
        field,
        (prev) => {
          const next = [...prev];
          next.splice(index2, 0, next.splice(index1, 1)[0]);
          return next;
        },
        opts2
      );
      metaHelper.metaHelper(this).handleArrayFieldMetaShift(field, index1, "move", index2);
      this.validateField(field, "change");
      this.validateField(`${field}[${index1}]`, "change");
      this.validateField(`${field}[${index2}]`, "change");
    };
    this.clearFieldValues = (field, opts2) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(field, [], opts2);
      if (lastIndex !== null) {
        for (let i = 0; i <= lastIndex; i++) {
          const fieldKey = `${field}[${i}]`;
          this.deleteField(fieldKey);
        }
      }
      this.validateField(field, "change");
    };
    this.resetField = (field) => {
      this.baseStore.setState((prev) => {
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: metaHelper.defaultFieldMeta
          },
          values: this.options.defaultValues ? utils.setBy(prev.values, field, utils.getBy(this.options.defaultValues, field)) : prev.values
        };
      });
    };
    this.getAllErrors = () => {
      return {
        form: {
          errors: this.state.errors,
          errorMap: this.state.errorMap
        },
        fields: Object.entries(this.state.fieldMeta).reduce(
          (acc, [fieldName, fieldMeta]) => {
            if (Object.keys(fieldMeta).length && fieldMeta.errors.length) {
              acc[fieldName] = {
                errors: fieldMeta.errors,
                errorMap: fieldMeta.errorMap
              };
            }
            return acc;
          },
          {}
        )
      };
    };
    this.parseValuesWithSchema = (schema) => {
      return standardSchemaValidator.standardSchemaValidators.validate(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.parseValuesWithSchemaAsync = (schema) => {
      return standardSchemaValidator.standardSchemaValidators.validateAsync(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.baseStore = new store.Store(
      getDefaultFormState({
        ...opts == null ? void 0 : opts.defaultState,
        values: (opts == null ? void 0 : opts.defaultValues) ?? ((_a = opts == null ? void 0 : opts.defaultState) == null ? void 0 : _a.values)
      })
    );
    this.fieldMetaDerived = new store.Derived({
      deps: [this.baseStore],
      fn: ({ prevDepVals, currDepVals, prevVal: _prevVal }) => {
        var _a2, _b, _c;
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals == null ? void 0 : prevDepVals[0];
        const currBaseStore = currDepVals[0];
        let originalMetaCount = 0;
        const fieldMeta = {};
        for (const fieldName of Object.keys(
          currBaseStore.fieldMetaBase
        )) {
          const currBaseMeta = currBaseStore.fieldMetaBase[fieldName];
          const prevBaseMeta = prevBaseStore == null ? void 0 : prevBaseStore.fieldMetaBase[fieldName];
          const prevFieldInfo = prevVal == null ? void 0 : prevVal[fieldName];
          const curFieldVal = utils.getBy(currBaseStore.values, fieldName);
          let fieldErrors = prevFieldInfo == null ? void 0 : prevFieldInfo.errors;
          if (!prevBaseMeta || currBaseMeta.errorMap !== prevBaseMeta.errorMap) {
            fieldErrors = Object.values(currBaseMeta.errorMap ?? {}).filter(
              (val) => val !== void 0
            );
            const fieldInstance = (_a2 = this.getFieldInfo(fieldName)) == null ? void 0 : _a2.instance;
            if (fieldInstance && !fieldInstance.options.disableErrorFlat) {
              fieldErrors = fieldErrors == null ? void 0 : fieldErrors.flat(
                1
              );
            }
          }
          const isFieldValid = !utils.isNonEmptyArray(fieldErrors ?? []);
          const isFieldPristine = !currBaseMeta.isDirty;
          const isDefaultValue = utils.evaluate(
            curFieldVal,
            utils.getBy(this.options.defaultValues, fieldName)
          ) || utils.evaluate(
            curFieldVal,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (_c = (_b = this.getFieldInfo(fieldName)) == null ? void 0 : _b.instance) == null ? void 0 : _c.options.defaultValue
          );
          if (prevFieldInfo && prevFieldInfo.isPristine === isFieldPristine && prevFieldInfo.isValid === isFieldValid && prevFieldInfo.isDefaultValue === isDefaultValue && prevFieldInfo.errors === fieldErrors && currBaseMeta === prevBaseMeta) {
            fieldMeta[fieldName] = prevFieldInfo;
            originalMetaCount++;
            continue;
          }
          fieldMeta[fieldName] = {
            ...currBaseMeta,
            errors: fieldErrors,
            isPristine: isFieldPristine,
            isValid: isFieldValid,
            isDefaultValue
          };
        }
        if (!Object.keys(currBaseStore.fieldMetaBase).length) return fieldMeta;
        if (prevVal && originalMetaCount === Object.keys(currBaseStore.fieldMetaBase).length) {
          return prevVal;
        }
        return fieldMeta;
      }
    });
    this.store = new store.Derived({
      deps: [this.baseStore, this.fieldMetaDerived],
      fn: ({ prevDepVals, currDepVals, prevVal: _prevVal }) => {
        var _a2, _b, _c, _d;
        const prevVal = _prevVal;
        const prevBaseStore = prevDepVals == null ? void 0 : prevDepVals[0];
        const currBaseStore = currDepVals[0];
        const currFieldMeta = currDepVals[1];
        const fieldMetaValues = Object.values(currFieldMeta).filter(
          Boolean
        );
        const isFieldsValidating = fieldMetaValues.some(
          (field) => field.isValidating
        );
        const isFieldsValid = fieldMetaValues.every((field) => field.isValid);
        const isTouched = fieldMetaValues.some((field) => field.isTouched);
        const isBlurred = fieldMetaValues.some((field) => field.isBlurred);
        const isDefaultValue = fieldMetaValues.every(
          (field) => field.isDefaultValue
        );
        const shouldInvalidateOnMount = (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          isTouched && ((_a2 = currBaseStore.errorMap) == null ? void 0 : _a2.onMount)
        );
        const isDirty = fieldMetaValues.some((field) => field.isDirty);
        const isPristine = !isDirty;
        const hasOnMountError = Boolean(
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          ((_b = currBaseStore.errorMap) == null ? void 0 : _b.onMount) || // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          fieldMetaValues.some((f) => {
            var _a3;
            return (_a3 = f == null ? void 0 : f.errorMap) == null ? void 0 : _a3.onMount;
          })
        );
        const isValidating = !!isFieldsValidating;
        let errors = (prevVal == null ? void 0 : prevVal.errors) ?? [];
        if (!prevBaseStore || currBaseStore.errorMap !== prevBaseStore.errorMap) {
          errors = Object.values(currBaseStore.errorMap).reduce((prev, curr) => {
            if (curr === void 0) return prev;
            if (curr && utils.isGlobalFormValidationError(curr)) {
              prev.push(curr.form);
              return prev;
            }
            prev.push(curr);
            return prev;
          }, []);
        }
        const isFormValid = errors.length === 0;
        const isValid = isFieldsValid && isFormValid;
        const submitInvalid = this.options.canSubmitWhenInvalid ?? false;
        const canSubmit = currBaseStore.submissionAttempts === 0 && !isTouched && !hasOnMountError || !isValidating && !currBaseStore.isSubmitting && isValid || submitInvalid;
        let errorMap = currBaseStore.errorMap;
        if (shouldInvalidateOnMount) {
          errors = errors.filter(
            (err) => err !== currBaseStore.errorMap.onMount
          );
          errorMap = Object.assign(errorMap, { onMount: void 0 });
        }
        if (prevVal && prevBaseStore && prevVal.errorMap === errorMap && prevVal.fieldMeta === this.fieldMetaDerived.state && prevVal.errors === errors && prevVal.isFieldsValidating === isFieldsValidating && prevVal.isFieldsValid === isFieldsValid && prevVal.isFormValid === isFormValid && prevVal.isValid === isValid && prevVal.canSubmit === canSubmit && prevVal.isTouched === isTouched && prevVal.isBlurred === isBlurred && prevVal.isPristine === isPristine && prevVal.isDefaultValue === isDefaultValue && prevVal.isDirty === isDirty && utils.evaluate(prevBaseStore, currBaseStore)) {
          return prevVal;
        }
        let state = {
          ...currBaseStore,
          errorMap,
          fieldMeta: this.fieldMetaDerived.state,
          errors,
          isFieldsValidating,
          isFieldsValid,
          isFormValid,
          isValid,
          canSubmit,
          isTouched,
          isBlurred,
          isPristine,
          isDefaultValue,
          isDirty
        };
        const transformArray = ((_c = this.options.transform) == null ? void 0 : _c.deps) ?? [];
        const shouldTransform = transformArray.length !== this.prevTransformArray.length || transformArray.some((val, i) => val !== this.prevTransformArray[i]);
        if (shouldTransform) {
          const newObj = Object.assign({}, this, { state });
          (_d = this.options.transform) == null ? void 0 : _d.fn(newObj);
          state = newObj.state;
          this.prevTransformArray = transformArray;
        }
        return state;
      }
    });
    this.handleSubmit = this.handleSubmit.bind(this);
    this.update(opts || {});
  }
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (standardSchemaValidator.isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidator.standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
  async handleSubmit(submitMeta) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    this.baseStore.setState((old) => ({
      ...old,
      // Submission attempts mark the form as not submitted
      isSubmitted: false,
      // Count submission attempts
      submissionAttempts: old.submissionAttempts + 1,
      isSubmitSuccessful: false
      // Reset isSubmitSuccessful at the start of submission
    }));
    store.batch(() => {
      void Object.values(this.fieldInfo).forEach(
        (field) => {
          if (!field.instance) return;
          if (!field.instance.state.meta.isTouched) {
            field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
          }
        }
      );
    });
    if (!this.state.canSubmit) return;
    this.baseStore.setState((d) => ({ ...d, isSubmitting: true }));
    const done = () => {
      this.baseStore.setState((prev) => ({ ...prev, isSubmitting: false }));
    };
    await this.validateAllFields("submit");
    if (!this.state.isFieldsValid) {
      done();
      (_b = (_a = this.options).onSubmitInvalid) == null ? void 0 : _b.call(_a, {
        value: this.state.values,
        formApi: this
      });
      return;
    }
    await this.validate("submit");
    if (!this.state.isValid) {
      done();
      (_d = (_c = this.options).onSubmitInvalid) == null ? void 0 : _d.call(_c, {
        value: this.state.values,
        formApi: this
      });
      return;
    }
    store.batch(() => {
      void Object.values(this.fieldInfo).forEach(
        (field) => {
          var _a2, _b2, _c2;
          (_c2 = (_b2 = (_a2 = field.instance) == null ? void 0 : _a2.options.listeners) == null ? void 0 : _b2.onSubmit) == null ? void 0 : _c2.call(_b2, {
            value: field.instance.state.value,
            fieldApi: field.instance
          });
        }
      );
    });
    (_f = (_e = this.options.listeners) == null ? void 0 : _e.onSubmit) == null ? void 0 : _f.call(_e, { formApi: this });
    try {
      await ((_h = (_g = this.options).onSubmit) == null ? void 0 : _h.call(_g, {
        value: this.state.values,
        formApi: this,
        meta: submitMeta ?? this.options.onSubmitMeta
      }));
      store.batch(() => {
        this.baseStore.setState((prev) => ({
          ...prev,
          isSubmitted: true,
          isSubmitSuccessful: true
          // Set isSubmitSuccessful to true on successful submission
        }));
        done();
      });
    } catch (err) {
      this.baseStore.setState((prev) => ({
        ...prev,
        isSubmitSuccessful: false
        // Ensure isSubmitSuccessful is false if an error occurs
      }));
      done();
      throw err;
    }
  }
  /**
   * Updates the form's errorMap
   */
  setErrorMap(errorMap) {
    store.batch(() => {
      Object.entries(errorMap).forEach(([key, value]) => {
        const errorMapKey = key;
        if (utils.isGlobalFormValidationError(value)) {
          const { formError, fieldErrors } = normalizeError(value);
          for (const fieldName of Object.keys(
            this.fieldInfo
          )) {
            const fieldMeta = this.getFieldMeta(fieldName);
            if (!fieldMeta) continue;
            this.setFieldMeta(fieldName, (prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: fieldErrors == null ? void 0 : fieldErrors[fieldName]
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                [errorMapKey]: "form"
              }
            }));
          }
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [errorMapKey]: formError
            }
          }));
        } else {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [errorMapKey]: value
            }
          }));
        }
      });
    });
  }
}
function normalizeError(rawError) {
  if (rawError) {
    if (utils.isGlobalFormValidationError(rawError)) {
      const formError = normalizeError(rawError.form).formError;
      const fieldErrors = rawError.fields;
      return { formError, fieldErrors };
    }
    return { formError: rawError };
  }
  return { formError: void 0 };
}
function getErrorMapKey(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "change":
    default:
      return "onChange";
  }
}
exports.FormApi = FormApi;
//# sourceMappingURL=FormApi.cjs.map
