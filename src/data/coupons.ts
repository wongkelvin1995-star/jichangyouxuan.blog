/**
 * 优惠码登记表（站长提供，2026-10-30 收到）。只登记有明确来源的优惠码，没有就不填。
 * 补充或修改：编辑下面对应的一行即可，卡片、详细页、首页会自动同步。
 * 注意：优惠码是否生效、适用哪些套餐，以对应品牌结算页为准；价格表里的价格不含任何优惠码。
 */
const NOTE = '站长提供的优惠码，是否仍有效、适用哪些套餐以结算页为准。';

export const coupons: Record<string, { code: string; note?: string }> = {
  lingdongyun: { code: "ld888", note: NOTE }, // 灵动云
  "muguang-jiasu": { code: "mm88", note: NOTE }, // 暮光加速
  flyv: { code: "fly20", note: NOTE }, // 飞V
  laddercloud: { code: "tzy888", note: NOTE }, // 梯子云
  wavenet: { code: "lw888", note: NOTE }, // 浪网
  yinxingren: { code: "yxr888", note: NOTE }, // 隐形人
  feimaoyun: { code: "flycat888", note: NOTE }, // 飞猫云
  stardream: { code: "nmw888", note: NOTE }, // 星岛梦
  lightspeed: { code: "AMM", note: NOTE }, // 光速云
  v2yun: { code: "rabbit", note: NOTE }, // 唯兔云
  u1s1: { code: "U1S1", note: NOTE }, // U1S1
  jilianyun: { code: "JLY888", note: NOTE }, // 极连云
  quanqiuyun: { code: "qq88", note: NOTE }, // 全球云
  guangnianti: { code: "GN888", note: NOTE }, // 光年梯
  sogoyun: { code: "SOGO10000", note: NOTE }, // Sogo云
  yuzhouyun: { code: "YUZHOU553", note: NOTE }, // 宇宙云
  ermaoyun: { code: "ermao888", note: NOTE }, // 二猫云
  yifanyun: { code: "1FLYYUN", note: NOTE }, // 一翻云
  edgenova: { code: "VA888", note: NOTE }, // 边缘节点
  kexinyun: { code: "kxy80", note: NOTE }, // 可信云
  sujie: { code: "sujie888", note: NOTE }, // 速界
  kuaili: { code: "kuaili996", note: NOTE }, // 快狸
  breezenet: { code: "weifeng90", note: NOTE }, // 微风网络
  wuyou: { code: "wuyou666", note: NOTE }, // 无忧链接
  lingmao: { code: "lingmao", note: NOTE }, // 灵猫
  flashleap: { code: "shanyue", note: NOTE }, // 闪跃
  firefly: { code: "firefly", note: NOTE }, // 飞为
  kuajie: { code: "kuajie", note: NOTE }, // 跨界
  liulianyun: { code: "ll88", note: NOTE }, // 榴莲云
  dalaoyun: { code: "dly88", note: NOTE }, // 大佬云
  shandianyun: { code: "sd88", note: NOTE }, // 闪电云
  huanqiuyun: { code: "HQ66", note: NOTE }, // 环球云
  shenxingyun: { code: "sx0077", note: NOTE }, // 神行云
  yunjieyun: { code: "yjx888", note: NOTE }, // 云界云
};
