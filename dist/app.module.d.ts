import { OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bull';
import { StaffService } from '@/staff.service';
export declare class AppModule implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
    private readonly q;
    private readonly tQ;
    private readonly staffService;
    constructor(q: Queue, tQ: Queue, staffService: StaffService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    onApplicationShutdown(signal?: string): Promise<void>;
}
