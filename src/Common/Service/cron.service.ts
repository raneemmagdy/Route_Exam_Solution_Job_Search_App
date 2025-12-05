import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OtpRepository } from 'src/DB/Repository/otp.repository';



@Injectable()
export class OtpCleanupService {
    constructor(private readonly OtpRepository: OtpRepository) { }

    @Cron(CronExpression.EVERY_6_HOURS)
    async handleCron(): Promise<void> {
        const now = new Date();
        const result = await this.OtpRepository.deleteMany({ filter: { expiredIn: { $lt: now } } });
        console.log(`Deleted ${result.deletedCount} expired OTPs at ${now.toISOString()}`);
    }
}
