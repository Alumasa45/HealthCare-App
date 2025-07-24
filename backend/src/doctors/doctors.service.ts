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
import { User_Type, Account_Status } from 'src/users/entities/user.entity';
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
      const userDto = {
        Email: createDoctorDto.Email,
        Password: createDoctorDto.Password,
        Phone_Number: createDoctorDto.Phone_Number,
        First_Name: createDoctorDto.First_Name,
        Last_Name: createDoctorDto.Last_Name,
        Date_of_Birth: createDoctorDto.Date_of_Birth,
        Gender: createDoctorDto.Gender,
        User_Type: User_Type.Doctor,
        Account_Status: Account_Status.Active,
      };

      const createdUser = await this.usersService.create(userDto);

      const doctor = this.doctorRepository.create({
        User_id: createdUser.User_id,
        Specialization: createDoctorDto.Specialization,
        Experience_Years: createDoctorDto.Experience_Years,
        License_number: createDoctorDto.License_number,
        Qualification: createDoctorDto.Qualification,
        Department: createDoctorDto.Department,
        Bio: createDoctorDto.Bio,
        Languages_Spoken: createDoctorDto.Languages_Spoken,
        Is_Available_Online: createDoctorDto.Is_Available_Online,
        Rating: createDoctorDto.Rating,
        Reviews: createDoctorDto.Reviews,
        Created_at: createDoctorDto.Created_at || new Date(),
        Updated_at: createDoctorDto.Updated_at || new Date(),
      });

      const savedDoctor = await this.doctorRepository.save(doctor);
      return savedDoctor;
    } catch (error) {
      this.logger.error('Failed to create doctor', error.stack);
      throw new BadRequestException({
        message: 'Failed to create Doctor.',
        error: error.message,
      });
    }
  }

  async doctorLogin(License_number: string) {
    try {
      this.logger.log(`Attempting login for license number: ${License_number}`);

      const doctor = await this.doctorRepository.findOne({
        where: { License_number }
      });

      if (!doctor) {
        this.logger.warn(`Doctor with license ${License_number} not found!`);
        throw new UnauthorizedException('⚠Invalid Credentials');
      }

      // Get the associated user information
      const user = await this.usersService.findOne(doctor.User_id);
      if (!user) {
        throw new UnauthorizedException('Associated user not found');
      }

      // Create payload for JWT token
      const payload = {
        sub: doctor.Doctor_id,
        User_Type: 'Doctor',
        License_Number: doctor.License_number,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      // Return complete data structure matching frontend expectations
      return {
        token: accessToken,
        user: {
          User_id: user.User_id,
          Email: user.Email,
          Phone_Number: user.Phone_Number,
          First_Name: user.First_Name,
          Last_Name: user.Last_Name,
          Date_of_Birth: user.Date_of_Birth,
          Gender: user.Gender,
          User_Type: user.User_Type,
          Account_Status: user.Account_Status,
          Doctor_id: doctor.Doctor_id, // This is the key field needed!
        },
        doctor: {
          Doctor_id: doctor.Doctor_id,
          User_id: doctor.User_id,
          License_number: doctor.License_number,
          Specialization: doctor.Specialization,
          Qualification: doctor.Qualification,
          Experience_Years: doctor.Experience_Years,
          Department: doctor.Department,
          Bio: doctor.Bio,
          Languages_Spoken: doctor.Languages_Spoken,
          Is_Available_Online: doctor.Is_Available_Online,
          Rating: doctor.Rating,
          Reviews: doctor.Reviews,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw error;
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
