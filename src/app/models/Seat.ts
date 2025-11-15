import { Theater } from "./Theaters";
export class Seat {
    id!: number;
    location? :string;
    reclining!: boolean;
    theater?: Theater;
    
}