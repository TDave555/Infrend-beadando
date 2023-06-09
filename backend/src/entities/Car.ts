import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Travel } from "./Travel";

export enum Fuel {PETROL = "petrol", DIESEL = "diesel", ELECTRIC = "electric", HYBRID = "hybrid"};

@Entity()
export class Car {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    licensePlate: string;

    @Column()
    type: string;

    @Column('text')
    fuel: Fuel;

    @Column({
        type: "double"
    })
    consumption: number;

    @Column()
    mileage: number;

    @OneToMany(() => Travel, travel => travel.car)
    travels: Travel[];
}