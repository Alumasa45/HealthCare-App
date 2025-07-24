import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class CreateBlogDto {
    @ApiProperty({ description: 'Blog title.' })
    @IsString()
    Title: string;
    
    @ApiProperty({ description: 'Blog content.' })
    @IsString()
    Content: string;
    
    @ApiProperty({ description: 'Image link.' })
    @IsString()
    Image_url?: string;
    
    @ApiProperty({ description: 'Author of the blog.' })
    @IsString()
    Author: string;

}
