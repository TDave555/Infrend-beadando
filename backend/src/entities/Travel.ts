import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Car } from "./Car";
import { Driver } from "./Driver";

export enum Purpose {PRIVATE = "private", BUSINESS = "business"};

@Entity()
export class Travel {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    from: string;
    
    @Column()
    to: string;

    @Column('text')
    purpose: Purpose;

    @Column({
        type: "date"
    })
    startDate: Date;

    @Column()
    travelledDistance: number;
    
    @Column()
    newMileage: number;
    
    @ManyToOne(() => Driver, driver => driver.travels, {
        nullable: false,
        onDelete: 'CASCADE',
        eager: true
    })
    driver: Driver;
    
    @ManyToOne(() => Car, car => car.travels, {
        nullable: false,
        onDelete: 'CASCADE',
        eager: true
    })
    car: Car;
}