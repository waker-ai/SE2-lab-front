import {axios} from '../utils/request'
interface ChargeInfo {
    username: string;
    months :   number;
    amount :   number;
    membershipLevel: MembershipLevel;
}


interface MemberResponse {
    code: string;
    msg: string | null;
    data: Member[];
}

interface memberData{
    code:string;
    msg:string|null;
    data:Member;
}
export enum MembershipLevel {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM'
}
export interface IsMemberResponse {
    code: string;
    msg: string | null;
    data: boolean;
}

// Member 接口定义
export interface Member {
    id: number;
    username: string;
    membershipLevel: MembershipLevel;
    startDate: string; // 使用 ISO 8601 格式的日期字符串
    endDate: string; // 使用 ISO 8601 格式的日期字符串
    active: boolean;
}

export const charge=(chargeInfo:ChargeInfo)=>{
    return axios.post('/api/members/charge',null,{
        params:chargeInfo
    })
}
// 获取会员信息
export const getMember = (username: string) => {
    return axios.get<memberData>(`/api/members/${username}`);
}

// 检查是否是会员
export const checkMember = (username: string) => {
    return axios.get<IsMemberResponse>('/api/members/checkmember', {
        params: { username }
    });
}

export const getMembershipLevelPrice = (level: MembershipLevel): number => {
    switch (level) {
        case MembershipLevel.BRONZE:
            return 10;
        case MembershipLevel.SILVER:
            return 20;
        case MembershipLevel.GOLD:
            return 30;
        case MembershipLevel.PLATINUM:
            return 40;
        default:
            return 0;
    }
}

// 获取所有会员列表
export const getMemberList = () => {
    return axios.get<MemberResponse>('/api/members/list');
}