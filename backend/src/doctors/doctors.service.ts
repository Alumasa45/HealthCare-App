import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/patients/entities/patient.entity';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { JwtService } from '@nestjs/jwt';
import {
  User_Type,
  Account_Status,
  Gender,
} from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    try {
      this.logger.log(
        'Creating doctor with data:',
        JSON.stringify(createDoctorDto, null, 2),
      );

      // Validate required fields
      if (
        !createDoctorDto.Email ||
        !createDoctorDto.Password ||
        !createDoctorDto.License_number
      ) {
        throw new BadRequestException(
          'Email, Password, and License_number are required',
        );
      }

      // Check if license number already exists
      const existingDoctor = await this.doctorRepository.findOne({
        where: { License_number: createDoctorDto.License_number },
      });

      if (existingDoctor) {
        throw new BadRequestException(
          `Doctor with license number ${createDoctorDto.License_number} already exists`,
        );
      }

      const userDto = {
        Email: createDoctorDto.Email,
        Password: createDoctorDto.Password,
        Phone_Number: createDoctorDto.Phone_Number || '',
        First_Name: createDoctorDto.First_Name || '',
        Last_Name: createDoctorDto.Last_Name || '',
        Date_of_Birth: createDoctorDto.Date_of_Birth || '',
        Gender: (createDoctorDto.Gender as Gender) || Gender.Other,
        User_Type: User_Type.Doctor,
        Account_Status: Account_Status.Active,
      };

      this.logger.log(
        'Creating user with data:',
        JSON.stringify(userDto, null, 2),
      );
      let createdUser;
      try {
        createdUser = await this.usersService.create(userDto);
        this.logger.log(
          'User created successfully:',
          createdUser.user?.User_id,
        );
      } catch (userError) {
        this.logger.error('Failed to create user:', userError.message);
        if (userError.message?.includes('User already exists')) {
          throw new BadRequestException(
            'A user with this email already exists. Please use a different email.',
          );
        }
        throw new BadRequestException(
          `User creation failed: ${userError.message}`,
        );
      }

      const userId = createdUser.user?.User_id || createdUser.User_id;

      const doctor = this.doctorRepository.create({
        User_id: userId,
        Specialization: createDoctorDto.Specialization || '',
        Experience_Years: createDoctorDto.Experience_Years || 0,
        License_number: createDoctorDto.License_number,
        Qualification: createDoctorDto.Qualification || '',
        Department: createDoctorDto.Department || '',
        Bio: createDoctorDto.Bio || '',
        Languages_Spoken: createDoctorDto.Languages_Spoken || '',
        Is_Available_Online: createDoctorDto.Is_Available_Online || false,
        Rating: createDoctorDto.Rating || 0,
        Reviews: createDoctorDto.Reviews || '',
        Created_at: createDoctorDto.Created_at || new Date(),
        Updated_at: createDoctorDto.Updated_at || new Date(),
      });

      this.logger.log(
        'Saving doctor with data:',
        JSON.stringify(doctor, null, 2),
      );
      const savedDoctor = await this.doctorRepository.save(doctor);
      this.logger.log('Doctor created successfully:', savedDoctor.Doctor_id);
      return savedDoctor;
    } catch (error) {
      this.logger.error('Failed to create doctor', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to create Doctor.',
        error: error.message,
        details: error.detail || error.message,
      });
    }
  }

  async findAll(): Promise<Doctor[]> {
    try {
      const doctors = await this.doctorRepository.find();
      this.logger.log(`Retrieved ${doctors.length} doctors successfully.`);
      return doctors;
    } catch (error) {
      this.logger.error('Failed to retrieve doctors', error.stack);
      throw new BadRequestException('Failed to retrieve doctors.');
    }
  }

  async findOne(Doctor_id: number): Promise<Doctor> {
    try {
      const doctor = await this.doctorRepository.findOne({
        where: { Doctor_id },
      });
      if (!doctor) {
        this.logger.warn(`Doctor with Id ${Doctor_id}`);
        throw new NotFoundException('⚠ Doctor not found!');
      }
      return doctor;
    } catch (error) {
      this.logger.error(`Failed to find doctor with Id ${Doctor_id}`);
      throw new BadRequestException('Failed to find Doctor.');
    }
  }

  async update(
    Doctor_id: number,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<Doctor> {
    try {
      const doctor = await this.findOne(Doctor_id);
      Object.assign(doctor, updateDoctorDto);
      const updatedDoctor = await this.doctorRepository.save(doctor);
      this.logger.log(`Doctor with Id ${Doctor_id} updated successfully!`);
      return updatedDoctor;
    } catch (error) {
      this.logger.error(
        `Failed to update doctor info with Id ${Doctor_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update doctor info.');
    }
  }

  async delete(Doctor_id: number): Promise<{ message: string }> {
    try {
      const doctor = await this.findOne(Doctor_id);
      await this.doctorRepository.remove(doctor);
      this.logger.log(`Doctor deleted with ID: ${Doctor_id}`);
      return { message: 'Doctor deleted successfully.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete doctor with ID: ${Doctor_id}`,
        error.stack,
      );
      throw new BadRequestException('Failed to remove doctor.');
    }
  }

  async findByLicenseNumber(License_number: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { License_number },
    });
    if (!doctor) {
      throw new NotFoundException(
        `Doctor with license number ${License_number} not found`,
      );
    }
    return doctor;
  }
}
