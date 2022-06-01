import { OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bull';
export declare class AppModule implements OnModuleInit {
    private readonly q;
    private readonly tQ;
    constructor(q: Queue, tQ: Queue);
    onModuleInit(): Promise<void>;
}
