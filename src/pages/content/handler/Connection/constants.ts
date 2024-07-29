// PropertyId 枚举定义了各种语音服务相关的属性标识符
export enum PropertyId {
  // 语音服务连接相关
  SpeechServiceConnection_Key = 0,
  SpeechServiceConnection_Endpoint = 1,
  SpeechServiceConnection_Region = 2,
  SpeechServiceConnection_EndpointId = 5,
  SpeechServiceConnection_Host = 55,

  // 授权相关
  SpeechServiceAuthorization_Token = 3,
  SpeechServiceAuthorization_Type = 4,

  // 翻译相关
  SpeechServiceConnection_TranslationToLanguages = 6,
  SpeechServiceConnection_TranslationVoice = 7,
  SpeechServiceConnection_TranslationFeatures = 8,

  // 意图识别相关
  SpeechServiceConnection_IntentRegion = 9,

  // 代理设置
  SpeechServiceConnection_ProxyHostName = 10,
  SpeechServiceConnection_ProxyPort = 11,
  SpeechServiceConnection_ProxyUserName = 12,
  SpeechServiceConnection_ProxyPassword = 13,

  // 识别和合成设置
  SpeechServiceConnection_RecoMode = 14,
  SpeechServiceConnection_RecoLanguage = 15,
  SpeechServiceConnection_SynthLanguage = 17,
  SpeechServiceConnection_SynthVoice = 18,
  SpeechServiceConnection_SynthOutputFormat = 19,
  SpeechServiceConnection_AutoDetectSourceLanguages = 20,

  // 会话相关
  Speech_SessionId = 16,

  // 服务响应设置
  SpeechServiceResponse_RequestDetailedResultTrueFalse = 21,
  SpeechServiceResponse_RequestProfanityFilterTrueFalse = 22,
  SpeechServiceResponse_JsonResult = 23,
  SpeechServiceResponse_JsonErrorDetails = 24,

  // 取消详情
  CancellationDetails_Reason = 25,
  CancellationDetails_ReasonText = 26,
  CancellationDetails_ReasonDetailedText = 27,

  // 语言理解服务
  LanguageUnderstandingServiceResponse_JsonResult = 28,

  // 连接设置
  SpeechServiceConnection_Url = 29,
  SpeechServiceConnection_InitialSilenceTimeoutMs = 30,
  SpeechServiceConnection_EndSilenceTimeoutMs = 31,
  Speech_SegmentationSilenceTimeoutMs = 32,

  // 音频日志
  SpeechServiceConnection_EnableAudioLogging = 33,

  // 语言ID优先级
  SpeechServiceConnection_AtStartLanguageIdPriority = 34,
  SpeechServiceConnection_ContinuousLanguageIdPriority = 35,

  // 端点版本
  SpeechServiceConnection_RecognitionEndpointVersion = 36,

  // 响应选项
  SpeechServiceResponse_ProfanityOption = 37,
  SpeechServiceResponse_PostProcessingOption = 38,
  SpeechServiceResponse_RequestWordLevelTimestamps = 39,
  SpeechServiceResponse_StablePartialResultThreshold = 40,
  SpeechServiceResponse_OutputFormatOption = 41,
  SpeechServiceResponse_TranslationRequestStablePartialResult = 42,
  SpeechServiceResponse_RequestWordBoundary = 43,
  SpeechServiceResponse_RequestPunctuationBoundary = 44,
  SpeechServiceResponse_RequestSentenceBoundary = 45,

  // 会话相关
  Conversation_ApplicationId = 46,
  Conversation_DialogType = 47,
  Conversation_Initial_Silence_Timeout = 48,
  Conversation_From_Id = 49,
  Conversation_Conversation_Id = 50,
  Conversation_Custom_Voice_Deployment_Ids = 51,
  Conversation_Speech_Activity_Template = 52,
  Conversation_Request_Bot_Status_Messages = 53,
  Conversation_Agent_Connection_Id = 54,

  // 会话翻译器
  ConversationTranslator_Host = 56,
  ConversationTranslator_Name = 57,
  ConversationTranslator_CorrelationId = 58,
  ConversationTranslator_Token = 59,

  // 发音评估
  PronunciationAssessment_ReferenceText = 60,
  PronunciationAssessment_GradingSystem = 61,
  PronunciationAssessment_Granularity = 62,
  PronunciationAssessment_EnableMiscue = 63,
  PronunciationAssessment_Json = 64,
  PronunciationAssessment_Params = 65,

  // 说话人识别
  SpeakerRecognition_Api_Version = 66
}