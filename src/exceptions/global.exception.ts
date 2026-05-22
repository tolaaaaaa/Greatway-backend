import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger, NotFoundException } from "@nestjs/common"



@Catch()
export class GlobalExceptionFilters implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilters.name)

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const context: ErrorContext = {
      userId: "unauthenticated",
      level: "error",
      status: 500,
      path: request.url,
      method: request.method,
      message: "internal server error",
      timeStamp: new Date().toISOString(),
      stackTrace: exception.stack,
      cause: String(exception)
    }

    if (exception instanceof NotFoundException) {
      context.status = exception.getStatus()
      context.message = "route not found"
      this.logger.warn(`[${request.method}] ${request.url} - ${context.status}`)
    } else if (exception instanceof HttpException) {
      context.status = exception.getStatus()
      context.message = exception.message
      this.logger.warn(`[${request.method}] ${request.url} - ${context.status}: ${context.message}`)
    } else {
      this.logger.error(`[${request.method}] ${request.url} - ${context.message}`, exception.stack)
    }

    response.status(context.status).json({
      success: false,
      message: context.message
    })
  }
}