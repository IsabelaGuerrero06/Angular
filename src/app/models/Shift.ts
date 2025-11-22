import { Driver } from './Driver';
import { Motorcycle } from './Motorcycle';

export class Shift {
    id?: number;
    driver_id?: number;
    motorcycle_id?: number;
    start_time?: Date;
    end_time?: Date;
    status?: string;
    
    driver?: Driver;
    motorcycle?: Motorcycle;
}