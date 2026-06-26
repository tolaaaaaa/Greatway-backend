export interface IApplicationResponse {
    id: string,
    fullName: string,
    email: string,
    phoneNumber: string,
    resume: string
    coverLetter: string | null,
    job: {
        id: string,
        title: string,
        status: string,
        companyName: string 
    }
    startDate: Date,
    createdAt: Date,
    updatedAt: Date
}