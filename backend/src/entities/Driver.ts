import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Travel } from "./Travel";

@Entity()
export class Driver {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: "date"
    })
    birthdate: Date;

    @Column()
    address: string;

    @Column({
        unique: true,
        length: 8
    })
    driverLicense: string;

    @Column({
        type: "date"
    })
    driverLicenseExpiration: Date;

    @OneToMany(() => Travel, travel => travel.driver)
    travels: Travel[];
}
