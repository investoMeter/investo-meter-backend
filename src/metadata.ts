/* eslint-disable */
export default async () => {
    const t = {
        ['./level/models/basic-level-info.level']: await import(
            './level/models/basic-level-info.level'
        ),
        ['./level/models/tutorial-info.level']: await import(
            './level/models/tutorial-info.level'
        ),
        ['./common/TradeType.dto']: await import('./common/TradeType.dto'),
        ['./level/models/level-stock']: await import('./level/models/level-stock'),
        ['./auth/dto/response/register-response.dto']: await import(
            './auth/dto/response/register-response.dto'
        ),
        ['./auth/dto/response/login-response.dto']: await import(
            './auth/dto/response/login-response.dto'
        ),
        ['./auth/dto/response/logout-response.dto']: await import(
            './auth/dto/response/logout-response.dto'
        ),
        ['./auth/dto/response/refresh-response.dto']: await import(
            './auth/dto/response/refresh-response.dto'
        ),
        ['./level/dto/get-tutorial.level.dto']: await import(
            './level/dto/get-tutorial.level.dto'
        ),
        ['./level/dto/get-question.dto']: await import(
            './level/dto/get-question.dto'
        ),
        ['./level/dto/submit-answer.response.dto']: await import(
            './level/dto/submit-answer.response.dto'
        ),
        ['./level/dto/submit-answer.request.dto']: await import(
            './level/dto/submit-answer.request.dto'
        ),
    };
    return {
        '@nestjs/swagger': {
            models: [
                [
                    import('./auth/dto/request/login-request.dto'),
                    {
                        LoginRequestDto: {
                            username: { required: true, type: () => String },
                            password: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./auth/dto/request/register-request.dto'),
                    {
                        RegisterRequestDto: {
                            username: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            email: { required: true, type: () => String },
                            password: { required: true, type: () => String, minLength: 8 },
                        },
                    },
                ],
                [
                    import('./auth/dto/request/validate-otp-token.dto'),
                    {
                        ValidateOtpTokenDto: {
                            email: { required: true, type: () => String },
                            token: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./auth/dto/request/forgot-password-request.dto'),
                    {
                        ForgotPasswordRequestDto: {
                            email: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./auth/dto/request/new-password-request.dto'),
                    {
                        NewPasswordRequestDto: {
                            email: { required: true, type: () => String },
                            token: { required: true, type: () => String },
                            newPassword: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./auth/dto/response/login-response.dto'),
                    {
                        LoginResponseDto: {
                            id: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            username: { required: true, type: () => String },
                            email: { required: true, type: () => String },
                            accessToken: { required: true, type: () => String },
                            refreshToken: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./auth/dto/response/logout-response.dto'),
                    {
                        LogoutResponseDto: {
                            message: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./auth/dto/response/refresh-response.dto'),
                    {
                        RefreshResponseDto: {
                            id: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            username: { required: true, type: () => String },
                            email: { required: true, type: () => String },
                            refreshToken: { required: true, type: () => String },
                            accessToken: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./auth/dto/response/register-response.dto'),
                    {
                        RegisterResponseDto: {
                            id: { required: true, type: () => String },
                            name: { required: true, type: () => String },
                            username: { required: true, type: () => String },
                            email: { required: true, type: () => String },
                            access_token: { required: true, type: () => String },
                            refresh_token: { required: true, type: () => String },
                        },
                    },
                ],
                [
                    import('./level/dto/get-tutorial.level.dto'),
                    {
                        GetLevelTutorialDto: {
                            levelInfo: {
                                required: true,
                                type: () =>
                                    t['./level/models/basic-level-info.level'].BasicLevelInfo,
                            },
                            tutorialInfo: {
                                required: true,
                                type: () =>
                                    t['./level/models/tutorial-info.level'].TutorialInfo,
                            },
                        },
                    },
                ],
                [
                    import('./common/paginated-list.dto'),
                    {
                        PaginatedList: {
                            list: { required: true },
                            isLastPage: { required: true, type: () => Boolean },
                        },
                    },
                ],
                [
                    import('./level/dto/get-question.dto'),
                    {
                        getQuestionDto: {
                            id: { required: true, type: () => Number },
                            answer: {
                                required: true,
                                enum: t['./common/TradeType.dto'].TradeType,
                            },
                            levelStock: {
                                required: false,
                                type: () => t['./level/models/level-stock'].LevelStock,
                            },
                            timestamp: { required: true, type: () => Date },
                        },
                    },
                ],
                [
                    import('./level/dto/submit-answer.request.dto'),
                    {
                        SubmitAnswerRequestDto: {
                            questionId: { required: true, type: () => Number },
                            tradeType: {
                                required: true,
                                enum: t['./common/TradeType.dto'].TradeType,
                            },
                        },
                    },
                ],
                [
                    import('./level/dto/submit-answer.response.dto'),
                    {
                        SubmitAnswerResponseDto: {
                            correctAnswers: { required: true, type: () => Number },
                            wrongAnswers: { required: true, type: () => Number },
                            totalQuestions: { required: true, type: () => Number },
                        },
                    },
                ],
            ],
            controllers: [
                [
                    import('./auth/auth.controller'),
                    {
                        AuthController: {
                            register: {
                                type: t['./auth/dto/response/register-response.dto']
                                    .RegisterResponseDto,
                            },
                            login: {
                                type: t['./auth/dto/response/login-response.dto']
                                    .LoginResponseDto,
                            },
                            logout: {
                                type: t['./auth/dto/response/logout-response.dto']
                                    .LogoutResponseDto,
                            },
                            refresh: {
                                type: t['./auth/dto/response/refresh-response.dto']
                                    .RefreshResponseDto,
                            },
                            forgetPassword: { type: Object },
                            validateOtpToken: { type: Object },
                            newPassword: { type: Object },
                        },
                    },
                ],
                [
                    import('./level/level.controller'),
                    {
                        LevelController: {
                            getAllLevels: {},
                            getTutorial: {
                                type: t['./level/dto/get-tutorial.level.dto']
                                    .GetLevelTutorialDto,
                            },
                            getQuestion: {
                                type: t['./level/dto/get-question.dto'].getQuestionDto,
                            },
                            submitAnswer: {
                                type: t['./level/dto/submit-answer.response.dto']
                                    .SubmitAnswerResponseDto,
                            },
                        },
                    },
                ],
            ],
        },
    };
};
