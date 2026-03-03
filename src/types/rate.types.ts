/**
 * 评价相关类型定义
 */

// 评价列表查询参数
export interface RateListParams {
    rateType?: number      // 0=全部, 1=好评, -1=差评
    ratedUid?: string      // 被评价用户ID（账号ID）
    raterType?: number     // 0=全部, 6=来自买家, 7=来自卖家
    rowsPerPage?: number   // 每页数量
    pageNumber?: number    // 页码
    foldFlag?: number      // 折叠标志
    fishAdCode?: string    // 广告代码
    extraTag?: string      // 额外标签
}

// 评价数据
export interface RateData {
    appendCount: number
    bizCode: string
    feedback: string
    gmtCreate: string
    gmtCreateStr: string
    hasPraised: boolean
    highQuality: boolean
    idleCustomWordContents?: Array<{
        content: string
        idleRateEnum: string
        type: string
    }>
    ipAddress: string
    itemId: number
    itemPrice: number
    pictCdnUrlList: string[]
    praiseCount: number
    rate: number           // 1=好评, -1=差评
    rateId: number
    rateStatus: number
    rateTagList: Array<{
        bgColorList: number[]
        borderColor: number
        text: string
        textColor: number
    }>
    raterHeadImg: string
    raterUserNick: string
    tradeId: string       // 订单ID
}

// 评价卡片
export interface RateCard {
    cardData: RateData
    cardType: number
}

// 评价标签
export interface RateTab {
    fixed: boolean
    tabAttitude: number
    tabCount?: number
    tabName: string
    tabType: number
}

// 评价列表响应
export interface RateListResponse {
    cardList: RateCard[]
    nextPage: boolean
    rateTabDOList: RateTab[]
    totalCount: number
}

// 评价列表API完整响应
export interface RateListApiResponse {
    api: string
    data: RateListResponse
    ret: string[]
    traceId: string
    v: string
}
