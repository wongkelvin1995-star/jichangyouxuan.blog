/**
 * 「用码后」价格的统一计算：折扣率、不参与折扣的档位都来自 coupons.ts，页面不要自己写死数字。
 * 排序、每 GB 成本、榜单一律用原价（priceCny），用码后价格只作为额外标注显示。
 */
import { coupons } from './coupons';
import type { Plan } from './plans';

/** 该档位适用的折扣率；品牌没登记折扣率，或该档位被排除时返回 null */
export function couponRate(p: Plan): number | null {
  const c = coupons[p.airportSlug];
  if (!c?.discount) return null;
  if (c.excludePlans?.some((k) => p.planName.includes(k))) return null;
  return c.discount;
}
/** 用码后价格（元，最多两位小数） */
export function couponPrice(p: Plan): number | null {
  const r = couponRate(p);
  return r === null ? null : Math.round(p.priceCny * r * 100) / 100;
}
/** 品牌登记了折扣率，但这一档不参与 */
export const couponExcluded = (p: Plan) => !!coupons[p.airportSlug]?.discount && couponRate(p) === null;
/** 8 折 / 7.5 折 这样的中文写法 */
export const zheLabel = (rate: number) => `${Number((rate * 10).toFixed(1))} 折`;
export const money = (n: number) => String(Number(n.toFixed(2)));
export const perSuffix: Record<string, string> = { monthly: '/月', quarterly: '/季', 'half-year': '/半年', yearly: '/年', 'one-time': '' };
