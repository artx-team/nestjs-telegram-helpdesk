import { OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bull';
export declare class AppModule implements OnModuleInit {
    private readonly q;
    constructor(q: Queue);
    onModuleInit(): void;
}
