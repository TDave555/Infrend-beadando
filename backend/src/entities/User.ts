import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

export enum Role {ADMIN = "admin", USER = "user"};

@Entity()
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 64})
    nickname: string;

    @Column()
    email: string;

    @Column({length: 128})
    password: string;

    @Column('text')
    role: Role;
}