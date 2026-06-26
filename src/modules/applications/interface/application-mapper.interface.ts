import { Application } from "../entities/application.entity";
import { IApplicationResponse } from "./application-response.inteface";

export abstract class ApplicationResponseMapper implements IInterceptor {
    transform(data: Application): IApplicationResponse {
        return {
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            resume: data.resume,
            coverLetter: data?.coverLetter ?? null,
            phoneNumber: data.phoneNumber,
            startDate: data.startDate,
            job: {
                id: data?.job.id,
                companyName: data?.job.companyName,
                status: data?.job.status,
                title: data?.job.title
            },
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        }
    }
}