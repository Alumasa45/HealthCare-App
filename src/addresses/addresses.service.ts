import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
  try {
    const address = this.addressRepository.create({
      ...createAddressDto,
      Created_at: createAddressDto.Created_at || new Date(),

    });
    
    const savedAddress = await this.addressRepository.save(address);
    return savedAddress;
  } catch (error) {
    this.logger.error('Failed to create address', error.stack);
    throw new BadRequestException({
      message: 'Failed to add address',
      error: error.message,
    });
  }
}

  async findAll(): Promise<Address[]> {
    try {
      const addresses = await this.addressRepository.find();
      this.logger.log(`Retrieved ${addresses.length} addresses`);
      return addresses;
    } catch (error) {
      this.logger.error('Failed to retrieve addresses', error.stack);
      throw new BadRequestException('Failed to retrieve addresses');
    }
  }

  async findOne(Address_id: number): Promise<Address> {
    try {
      const address = await this.addressRepository.findOneBy({ Address_id });
      if (!address) {
        this.logger.warn(`Address not found with ID: ${Address_id}`);
        throw new NotFoundException('⚠ Address not found!');
      }
      return address;
    } catch (error) {
      this.logger.error(`Failed to find address with ID: ${Address_id}`, error.stack);
      throw new BadRequestException('Failed to retrieve address');
    }
  }

  async update(Address_id: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
    try {
      const address = await this.findOne(Address_id);
      Object.assign(address, updateAddressDto);
      const updatedAddress = await this.addressRepository.save(address);
      this.logger.log(`Address updated with ID: ${Address_id}`);
      return updatedAddress;
    } catch (error) {
      this.logger.error(`Failed to update address with ID: ${Address_id}`, error.stack);
      throw new BadRequestException('Failed to update address');
    }
  }

  async remove(Address_id: number): Promise<{ message: string }> {
    try {
      const address = await this.findOne(Address_id);
      await this.addressRepository.remove(address);
      this.logger.log(`Address deleted with ID: ${Address_id}`);
      return { message: 'Address deleted successfully.' };
    } catch (error) {
      this.logger.error(`Failed to delete address with ID: ${Address_id}`, error.stack);
      throw new BadRequestException('Failed to delete address');
    }
  }
}