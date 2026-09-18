"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  CloudSun,
  Download,
  Edit3,
  Footprints,
  Info,
  LocateFixed,
  MapPin,
  Menu,
  Music2,
  Plane,
  Plus,
  Save,
  ShieldCheck,
  Shirt,
  Ship,
  ShoppingBag,
  Smartphone,
  Sparkles,
  TrainFront,
  UtensilsCrossed,
  Upload,
  WalletCards,
  Waves,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import TripMap from "@/components/trip-map";

type Spot = {
  id: string;
  day: number;
  order: number;
  name: string;
  korean: string;
  type: "景点" | "美食" | "购物" | "酒店" | "演出";
  time: string;
  stay: string;
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  photoPosition: "left" | "center" | "right";
  photo?: string;
  photoSource?: string;
  photoCredit?: string;
  intro: string;
  tip: string;
  address: string;
};

type RouteInfo = {
  id: string;
  day: number;
  from: string;
  to: string;
  method: string;
  duration: string;
  note: string;
};

type TripId = "seoul" | "dalian";

const sampleSpots: Spot[] = [
  { id: "gyeongbokgung", day: 1, order: 1, name: "景福宫", korean: "경복궁", type: "景点", time: "09:00", stay: "2小时", x: 42, y: 27, photoPosition: "left", intro: "首尔五大宫之首。穿韩服可免费入场，上午光线也最适合拍照。", tip: "周二闭馆；守门将换岗仪式通常在光化门前举行，建议提前 15 分钟到。", address: "161 Sajik-ro, Jongno-gu" },
  { id: "bukchon", day: 1, order: 2, name: "北村韩屋村", korean: "북촌한옥마을", type: "景点", time: "12:10", stay: "1.5小时", x: 56, y: 22, photoPosition: "center", intro: "传统韩屋与首尔城市天际线交叠的散步区域，适合慢慢走、随走随拍。", tip: "这里仍有居民生活，请压低音量；坡路较多，穿防滑好走的鞋。", address: "37 Gyedong-gil, Jongno-gu" },
  { id: "gwangjang", day: 1, order: 3, name: "广藏市场", korean: "광장시장", type: "美食", time: "16:00", stay: "2小时", x: 63, y: 43, photoPosition: "center", intro: "从绿豆煎饼到紫菜包饭，一站式体验首尔传统市场小吃。", tip: "热门摊位可能排队；准备少量韩元现金更方便，先看清价格再点单。", address: "88 Changgyeonggung-ro, Jongno-gu" },
  { id: "seongsu", day: 2, order: 1, name: "圣水洞", korean: "성수동", type: "购物", time: "10:30", stay: "3小时", x: 78, y: 64, photoPosition: "center", intro: "旧工厂改造的咖啡店、买手店和品牌快闪集中地。", tip: "快闪店营业信息变化快；建议出发当天再确认品牌社交账号。", address: "Seongsu-dong 2-ga, Seongdong-gu" },
  { id: "seoulforest", day: 2, order: 2, name: "首尔林", korean: "서울숲", type: "景点", time: "14:20", stay: "1.5小时", x: 72, y: 70, photoPosition: "left", intro: "适合放慢节奏的城市森林，和圣水洞可连成轻松步行路线。", tip: "面积较大，不必走完全程；雨天可缩短停留，把时间留给室内咖啡店。", address: "273 Ttukseom-ro, Seongdong-gu" },
  { id: "namsan", day: 2, order: 3, name: "N首尔塔", korean: "N서울타워", type: "景点", time: "18:10", stay: "2小时", x: 47, y: 61, photoPosition: "right", intro: "在南山看首尔从日落到亮灯，是第一次来首尔很值得保留的夜景时段。", tip: "缆车排队时间波动大；风大时体感温度低，随身带一件薄外套。", address: "105 Namsangongwon-gil, Yongsan-gu" },
  { id: "hongdae", day: 3, order: 1, name: "弘大延南洞", korean: "홍대 · 연남동", type: "购物", time: "11:00", stay: "3小时", x: 22, y: 51, photoPosition: "center", intro: "独立小店、咖啡馆与街头文化密集，适合没有硬性目标的一段自由探索。", tip: "周末人流明显增加；购物后记得确认是否支持退税和退换货。", address: "Hongik-ro, Mapo-gu" },
  { id: "yeouido", day: 3, order: 2, name: "汝矣岛汉江公园", korean: "여의도한강공원", type: "景点", time: "15:30", stay: "1.5小时", x: 31, y: 72, photoPosition: "left", intro: "在汉江边休息、看日落，天气好时可以体验便利店煮拉面。", tip: "夜间江边风大；垃圾按分类回收，不要把食物留在草地。", address: "330 Yeouidong-ro, Yeongdeungpo-gu" },
  { id: "myeongdong", day: 3, order: 3, name: "明洞", korean: "명동", type: "购物", time: "18:30", stay: "2小时", x: 45, y: 49, photoPosition: "right", intro: "集中采购美妆、伴手礼的高效率收尾站，回酒店也相对方便。", tip: "不同门店赠品与退税门槛不同；护肤品注意托运行李液体规则。", address: "Myeongdong-gil, Jung-gu" },
];

const sampleRoutes: RouteInfo[] = [
  { id: "d1-1", day: 1, from: "景福宫", to: "北村韩屋村", method: "步行", duration: "约 22 分钟", note: "一路缓上坡，经过国立现代美术馆附近；雨天建议搭短程出租车。" },
  { id: "d1-2", day: 1, from: "北村韩屋村", to: "广藏市场", method: "地铁 + 步行", duration: "约 28 分钟", note: "安国站上车，钟路5街站下车。韩国地铁内避免大声通话。" },
  { id: "d2-1", day: 2, from: "圣水洞", to: "首尔林", method: "步行", duration: "约 18 分钟", note: "沿首尔林咖啡街步行即可，部分路段自行车较多，注意避让。" },
  { id: "d2-2", day: 2, from: "首尔林", to: "N首尔塔", method: "地铁 + 巴士", duration: "约 55 分钟", note: "高峰期换乘拥挤，建议预留 15 分钟；下山末班车时间要提前确认。" },
  { id: "d3-1", day: 3, from: "弘大延南洞", to: "汝矣岛汉江公园", method: "地铁", duration: "约 32 分钟", note: "使用 T-money 进出站；不要误乘机场铁路直达列车。" },
  { id: "d3-2", day: 3, from: "汝矣岛汉江公园", to: "明洞", method: "地铁", duration: "约 35 分钟", note: "晚餐时段人多，进站前先确认行驶方向，避免跨站台折返。" },
];

// Keep the original generic seed available as a reference while the workspace plan is active.
void sampleSpots;
void sampleRoutes;

// Parsed from 首尔4天3晚_Citywalk夜景加强版.html in this workspace.
const actualSpots: Spot[] = [
  { id: "airport", day: 1, order: 1, name: "仁川机场", korean: "인천국제공항", type: "景点", time: "13:00", stay: "3–4小时", x: 13, y: 81, lat: 37.4602, lng: 126.4407, photoPosition: "left", photo: "/places/airport.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Incheon_International_Airport,_South_Korea,_10_December_2021.jpg", photoCredit: "Wikimedia Commons", intro: "完成入境、取行李并搭乘 6001 机场巴士前往东大门。", tip: "保存酒店韩文地址；按机场现场指引确认 6001 站台。", address: "Incheon International Airport" },
  { id: "hotel", day: 1, order: 2, name: "东大门酒店", korean: "트래블로지 동대문 서울", type: "酒店", time: "16:30", stay: "办理入住", x: 63, y: 45, lat: 37.5664, lng: 127.0049, photoPosition: "center", photo: "/places/hotel.webp", photoSource: "https://www.travelodgehotels.asia/travelodge-dongdaemun-seoul/", photoCredit: "Travelodge 官方网站", intro: "三晚固定住宿点，也是每天路线的安全返回坐标。", tip: "入住时确认早餐、行李寄存和退房时间。", address: "Travelodge Dongdaemun Seoul" },
  { id: "gwangjang-real", day: 1, order: 3, name: "广藏市场", korean: "광장시장", type: "美食", time: "17:30", stay: "45分钟", x: 57, y: 40, lat: 37.5701, lng: 126.9995, photoPosition: "center", photo: "/places/gwangjang.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Gwangjang_Market,_Seoul_02.jpg", photoCredit: "Wikimedia Commons", intro: "用市场小吃认识首尔，再按体力决定正式晚饭。", tip: "晚到时市场和一只鸡只选一个，不叠两顿正餐。", address: "88 Changgyeonggung-ro, Jongno-gu" },
  { id: "cheonggye", day: 1, order: 4, name: "清溪川东段", korean: "청계천 오간수교", type: "景点", time: "19:00", stay: "45分钟", x: 66, y: 48, lat: 37.5688, lng: 127.0097, photoPosition: "right", photo: "/places/cheonggye.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Cheonggyecheon_evening_2.jpg", photoCredit: "Wikimedia Commons", intro: "沿河道与街灯慢走，作为第一晚夜景开场。", tip: "桥上俯拍或河边低机位选一种即可，注意湿滑台阶。", address: "Ogansugyo, Jongno-gu" },
  { id: "ddp", day: 1, order: 5, name: "东大门设计广场", korean: "동대문디자인플라자", type: "景点", time: "20:00", stay: "1小时", x: 72, y: 49, lat: 37.5665, lng: 127.0092, photoPosition: "right", photo: "/places/ddp.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Dongdaemun_Design_Plaza_at_night,_Seoul,_Korea.jpg", photoCredit: "Wikimedia Commons", intro: "用建筑曲面、人流和车灯完成 NIGHT 01。", tip: "不预设一定有灯光秀；人物用 1 倍，建筑可尝试 0.5 倍。", address: "281 Eulji-ro, Jung-gu" },
  { id: "forest-real", day: 2, order: 1, name: "首尔林", korean: "서울숲", type: "景点", time: "09:30", stay: "1.5小时", x: 73, y: 68, lat: 37.5444, lng: 127.0374, photoPosition: "left", photo: "/places/seoul-forest.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Seoul_Forest_Park.jpg", photoCredit: "Wikimedia Commons", intro: "从林地、镜池和城市绿意开始第二天。", tip: "控制在 60–90 分钟，给圣水和汉江保留体力。", address: "273 Ttukseom-ro, Seongdong-gu" },
  { id: "seongsu-real", day: 2, order: 2, name: "圣水演武场路", korean: "성수동 연무장길", type: "购物", time: "12:00", stay: "3小时", x: 80, y: 64, lat: 37.5437, lng: 127.0553, photoPosition: "center", photo: "/places/seongsu.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Industrial_buildings_in_Seongsu-dong.jpg", photoCredit: "Wikimedia Commons", intro: "午餐后沿红砖街区、品牌店和咖啡馆散步。", tip: "快闪信息变化快；同一天最多排一家热门店。", address: "Yeonmujang-gil, Seongdong-gu" },
  { id: "tukseom", day: 2, order: 3, name: "纛岛汉江公园", korean: "뚝섬한강공원", type: "景点", time: "16:45", stay: "2小时", x: 86, y: 78, lat: 37.5293, lng: 127.0698, photoPosition: "right", photo: "/places/ttukseom.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Ttukseom_Hangang_Park_20260416_2.jpg", photoCredit: "Wikimedia Commons", intro: "从日落前等到桥梁与对岸灯光完全亮起。", tip: "提前日落 45–60 分钟到；江边风大，带薄外套。", address: "139 Gangbyeonbuk-ro, Gwangjin-gu" },
  { id: "palace-real", day: 3, order: 1, name: "景福宫", korean: "경복궁", type: "景点", time: "09:00", stay: "2小时", x: 42, y: 27, lat: 37.5796, lng: 126.9770, photoPosition: "left", photo: "/places/gyeongbokgung.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Gyeonghoeru_(Royal_Banquet_Hall)_at_Gyeongbokgung_Palace,_Seoul.jpg", photoCredit: "Wikimedia Commons", intro: "老城线起点，重点看勤政殿、庆会楼和宫墙。", tip: "周二闭馆；是否穿韩服以天气和舒适为先。", address: "161 Sajik-ro, Jongno-gu" },
  { id: "samcheong", day: 3, order: 2, name: "三清洞", korean: "삼청동", type: "美食", time: "11:30", stay: "1小时", x: 50, y: 24, lat: 37.5846, lng: 126.9815, photoPosition: "center", photo: "/places/samcheong.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Seoul-Samcheong.dong-01.jpg", photoCredit: "Wikimedia Commons", intro: "用面片汤或简单韩餐补充体力。", tip: "排队过长就换附近餐厅，不错过北村时段。", address: "Samcheong-dong, Jongno-gu" },
  { id: "bukchon-real", day: 3, order: 3, name: "北村韩屋村", korean: "북촌한옥마을", type: "景点", time: "13:00", stay: "1小时", x: 56, y: 22, lat: 37.5826, lng: 126.9831, photoPosition: "center", photo: "/places/bukchon.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Bukchon-ro_11-gil_street_with_hanok_houses_at_blue_hour_in_Bukchon_Hanok_Village_Seoul.jpg", photoCredit: "Wikimedia Commons", intro: "选一段能看到韩屋屋脊与城市层次的坡道。", tip: "居民区内压低音量，不堵门口，遵守现场限时。", address: "37 Gyedong-gil, Jongno-gu" },
  { id: "ikseon", day: 3, order: 4, name: "益善洞", korean: "익선동 한옥거리", type: "美食", time: "14:30", stay: "1小时", x: 59, y: 35, lat: 37.5743, lng: 126.9897, photoPosition: "center", photo: "/places/ikseon.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Ikseon-dong_%EC%9D%B5%EC%84%A0%EB%8F%99_October_1_2020_3.jpg", photoCredit: "Wikimedia Commons", intro: "在韩屋巷里喝一杯，为傍晚骆山留出体力。", tip: "疲劳时删掉坐店，早点休息。", address: "Ikseon-dong, Jongno-gu" },
  { id: "naksan", day: 3, order: 5, name: "骆山公园城墙", korean: "낙산공원", type: "景点", time: "17:00", stay: "2小时", x: 70, y: 31, lat: 37.5805, lng: 127.0074, photoPosition: "right", photo: "/places/naksan.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Naksan_Park_2.jpg", photoCredit: "Wikimedia Commons", intro: "全程最高优先级夜景，从暮色看到城市完全亮起。", tip: "短途打车省上坡；不上墙、不跨护栏，蓝调时先拍合照。", address: "41 Naksan-gil, Jongno-gu" },
  { id: "myeongdong-real", day: 4, order: 1, name: "明洞圣堂", korean: "명동대성당", type: "景点", time: "09:00", stay: "1小时", x: 48, y: 49, lat: 37.5632, lng: 126.9870, photoPosition: "left", photo: "/places/myeongdong.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Myeongdong_Cathedral_2022-09-10.jpg", photoCredit: "Wikimedia Commons", intro: "返程日上午的轻量散步，用红砖建筑为行程收尾。", tip: "以外部参观为主，避开礼拜并保持安静。", address: "74 Myeongdong-gil, Jung-gu" },
  { id: "hotel-return", day: 4, order: 2, name: "酒店取行李", korean: "호텔 체크아웃", type: "酒店", time: "11:15", stay: "45分钟", x: 63, y: 45, lat: 37.5664, lng: 127.0049, photoPosition: "center", photo: "/places/hotel.webp", photoSource: "https://www.travelodgehotels.asia/travelodge-dongdaemun-seoul/", photoCredit: "Travelodge 官方网站", intro: "取包、退房并在中午前正式出发。", tip: "不要把最后一小时留给购物。", address: "Travelodge Dongdaemun Seoul" },
  { id: "port", day: 4, order: 3, name: "仁川国际码头", korean: "인천항 국제여객터미널", type: "景点", time: "15:00", stay: "登船", x: 11, y: 86, lat: 37.4225, lng: 126.5922, photoPosition: "right", photo: "/places/incheon-port.png", photoSource: "https://www.icpa.or.kr/icferry/mobile/content/view.do?contentKey=35&menuKey=323", photoCredit: "仁川港国际客运码头官网", intro: "地铁 1 号线至东仁川站，再打车前往国际客运码头。", tip: "不是机场也不是旧码头；至少提前 2–3 小时到港，并确认最晚报到时间。", address: "인천광역시 연수구 국제항만대로326번길 57" },
];

const actualRoutes: RouteInfo[] = [
  { id: "r11", day: 1, from: "仁川机场", to: "东大门酒店", method: "6001 机场巴士", duration: "90–120 分钟", note: "按机场现场指引确认站台，在 Baiton Hotel 站下车后步行去酒店。" },
  { id: "r12", day: 1, from: "东大门酒店", to: "广藏市场", method: "步行", duration: "15 分钟", note: "第一晚按体力调整；晚到就删减市场或正式晚饭。" },
  { id: "r13", day: 1, from: "广藏市场", to: "清溪川东段", method: "步行", duration: "12 分钟", note: "饭后沿河段慢走，夜间注意台阶与湿滑路面。" },
  { id: "r14", day: 1, from: "清溪川东段", to: "DDP", method: "步行", duration: "15 分钟", note: "不以限定活动为前提，建筑与街灯本身就是拍摄重点。" },
  { id: "r21", day: 2, from: "首尔林", to: "圣水演武场路", method: "步行", duration: "18 分钟", note: "沿街慢走即可，按体力选择咖啡店。" },
  { id: "r22", day: 2, from: "圣水演武场路", to: "纛岛汉江公园", method: "步行 + 地铁", duration: "30 分钟", note: "16:00 左右开始移动，确保在日落前到江边。" },
  { id: "r31", day: 3, from: "景福宫", to: "三清洞", method: "步行", duration: "15 分钟", note: "排队过长立即换店。" },
  { id: "r32", day: 3, from: "三清洞", to: "北村韩屋村", method: "步行", duration: "12 分钟", note: "坡路较多，穿防滑好走的鞋。" },
  { id: "r33", day: 3, from: "北村韩屋村", to: "益善洞", method: "步行", duration: "22 分钟", note: "只安排一间咖啡店，把体力留给骆山。" },
  { id: "r34", day: 3, from: "益善洞", to: "骆山公园城墙", method: "短途出租车", duration: "15 分钟", note: "省掉一段上坡；骆山不与南山塔叠加。" },
  { id: "r41", day: 4, from: "明洞圣堂", to: "酒店取行李", method: "地铁", duration: "25 分钟", note: "10:30 前结束明洞短走，确保有时间退房。" },
  { id: "r42", day: 4, from: "酒店取行李", to: "仁川国际码头", method: "地铁 1 号线 + 出租车", duration: "2–3 小时", note: "确认仁川方向支线，到东仁川站后打车；以报到截止时间倒推。" },
];

const dalianSpots: Spot[] = [
  { id: "dl-north-arrive", day: 1, order: 1, name: "大连北站", korean: "抵达大连", type: "景点", time: "16:41", stay: "20分钟", x: 50, y: 45, lat: 39.0152, lng: 121.6027, photoPosition: "center", photo: "/places/dalian/dalian-north.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Dalian_North_Railway_Station_2017.jpg", photoCredit: "Baycrest / Wikimedia Commons", intro: "抵达后直接从南广场地下进入地铁，第一晚只安排入住、海鲜和西安路散步，不把行程塞满。", tip: "下车先确认返程检票口和地铁入口；地铁 1 号线往河口方向可直达西安路。", address: "大连市甘井子区华北路" },
  { id: "dl-hotel-1", day: 1, order: 2, name: "西安路酒店", korean: "西安路站附近", type: "酒店", time: "17:40", stay: "办理入住", x: 50, y: 45, lat: 38.9190, lng: 121.5935, photoPosition: "center", photo: "/places/dalian/xian-road.jpg", photoSource: "https://www.td365.com.cn/newsportal/detail/15716", photoCredit: "西安路夜市资料图", intro: "两晚都住西安路站附近：去星海、体育中心和大连北站都能坐地铁直达或少换乘。", tip: "到店后立刻确认周日能否寄存或快速退房；把酒店门牌和电话截图。", address: "大连地铁西安路站附近" },
  { id: "dl-seafood-1", day: 1, order: 3, name: "老大连海鲜晚餐", korean: "西安路店", type: "美食", time: "18:40", stay: "1.5小时", x: 50, y: 45, lat: 38.9170, lng: 121.5968, photoPosition: "center", photo: "/places/dalian/seafood.jpg", photoSource: "https://us.trip.com/restaurant/china/dalian/detail/restaurant-133602295/", photoCredit: "携程用户实拍", intro: "第一顿集中体验海肠捞饭、海胆水饺或烤生蚝。一个人建议只点一份主食加一份小海鲜，避免东北菜分量过大。", tip: "参考店为同泰街 91 号的老大连·大连海鲜大连菜；周五晚可能排队，到店前先在线取号并核对最新地址。", address: "沙河口区同泰街91号" },
  { id: "dl-xian-night", day: 1, order: 4, name: "西安路夜逛", korean: "商圈与长兴里", type: "购物", time: "20:20", stay: "1小时", x: 50, y: 45, lat: 38.9191, lng: 121.5898, photoPosition: "center", photo: "/places/dalian/xian-road.jpg", photoSource: "https://www.td365.com.cn/newsportal/detail/15716", photoCredit: "西安路夜市资料图", intro: "饭后在西安路商圈轻松走一圈，买水和第二天早餐，不专门跨城追网红店。", tip: "演唱会是本次主目标，第一晚 22:00 前回酒店，保证第二天体力。", address: "西安路商圈 / 长兴里" },

  { id: "dl-hotel-start", day: 2, order: 1, name: "西安路酒店出发", korean: "轻装看海", type: "酒店", time: "08:30", stay: "出发", x: 50, y: 45, lat: 38.9190, lng: 121.5935, photoPosition: "center", photo: "/places/dalian/xian-road.jpg", photoSource: "https://www.td365.com.cn/newsportal/detail/15716", photoCredit: "西安路夜市资料图", intro: "只背小包出门，演唱会证件与充电宝先检查一遍。", tip: "海边风比市区明显，薄外套不要留在酒店。", address: "大连地铁西安路站附近" },
  { id: "dl-xinghai-square", day: 2, order: 2, name: "星海广场", korean: "城市地标与海湾", type: "景点", time: "09:10", stay: "1小时", x: 50, y: 45, lat: 38.8811, lng: 121.5830, photoPosition: "center", photo: "/places/dalian/xinghai-square.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Dalian_Xinghai_Square.jpg", photoCredit: "JesseW900 / Wikimedia Commons", intro: "先看广场尺度、海湾和跨海大桥。上午人相对少，也给下午回酒店休息留出余量。", tip: "广场很大，不追求走完；海鸥和喷泉受季节、天气影响，不把它们作为硬性项目。", address: "大连市沙河口区中山路" },
  { id: "dl-xinghai-park", day: 2, order: 3, name: "星海公园海边", korean: "海岸慢走", type: "景点", time: "10:30", stay: "1小时", x: 50, y: 45, lat: 38.8832, lng: 121.5638, photoPosition: "center", photo: "/places/dalian/xinghai-park.jpg", photoSource: "https://you.ctrip.com/travels/dalian4/4069801.html", photoCredit: "携程游记实拍", intro: "沿海边走一小段，看看礁石、海面和星海湾大桥；这是本次行程最纯粹的看海时间。", tip: "9 月下旬海风偏凉，岸边石头湿滑；不下水、不翻越护栏。", address: "大连市沙河口区中山路634号" },
  { id: "dl-seafood-2", day: 2, order: 4, name: "海鲜午餐", korean: "海肠捞饭 / 海胆水饺", type: "美食", time: "12:00", stay: "1.5小时", x: 50, y: 45, lat: 38.8870, lng: 121.5705, photoPosition: "center", photo: "/places/dalian/seafood.jpg", photoSource: "https://us.trip.com/restaurant/china/dalian/detail/restaurant-133602295/", photoCredit: "携程用户实拍", intro: "在星海片区选一家评分稳定、支持单人点餐的店。优先海肠捞饭或海胆水饺，昨天吃过的就换一种。", tip: "不要挑战多人份蒸汽海鲜锅；一个人按‘一主食＋一贝类/生蚝’点，预算约 80–150 元。", address: "星海公园 / 黑石礁附近" },
  { id: "dl-hotel-rest", day: 2, order: 5, name: "回酒店休息", korean: "为演唱会留体力", type: "酒店", time: "14:00", stay: "2小时", x: 50, y: 45, lat: 38.9190, lng: 121.5935, photoPosition: "center", photo: "/places/dalian/xian-road.jpg", photoSource: "https://www.td365.com.cn/newsportal/detail/15716", photoCredit: "西安路夜市资料图", intro: "午后回酒店充电、洗漱、整理随身物品，避开在演出前继续暴走。", tip: "16:20 前完成换装和补水，电子票、身份证、充电宝、耳塞逐项检查。", address: "大连地铁西安路站附近" },
  { id: "dl-concert", day: 2, order: 6, name: "薛之谦·万兽之王", korean: "大连体育中心体育场", type: "演出", time: "17:15", stay: "约5小时", x: 50, y: 45, lat: 39.0200, lng: 121.5640, photoPosition: "center", photo: "/places/dalian/concert.png", photoSource: "https://www.dlsportscenter.com/index.php/article/show/id/3870/language/cn/", photoCredit: "大连体育中心官方", intro: "9 月 26 日 19:30 开唱。计划 17:15 左右抵达，留足安检、找入口、上洗手间和进场时间。", tip: "乘地铁 2 号线在体育中心站下车；按电子票夹中的入口走。散场听从现场导流，临时封站或延时安排以当天大连地铁公告为准。", address: "大连市甘井子区岚岭路699号" },

  { id: "dl-hotel-out", day: 3, order: 1, name: "酒店退房", korean: "西安路站", type: "酒店", time: "08:10", stay: "10分钟", x: 50, y: 45, lat: 38.9190, lng: 121.5935, photoPosition: "center", photo: "/places/dalian/xian-road.jpg", photoSource: "https://www.td365.com.cn/newsportal/detail/15716", photoCredit: "西安路夜市资料图", intro: "返程日不再塞景点，退房后直接去大连北站。", tip: "最迟 08:20 离店；前一晚把行李完全收好，闹钟设两个。", address: "大连地铁西安路站附近" },
  { id: "dl-north-leave", day: 3, order: 2, name: "大连北站返程", korean: "10:29 发车", type: "景点", time: "09:00", stay: "候车", x: 50, y: 45, lat: 39.0152, lng: 121.6027, photoPosition: "center", photo: "/places/dalian/dalian-north.jpg", photoSource: "https://commons.wikimedia.org/wiki/File:Dalian_North_Railway_Station_2017.jpg", photoCredit: "Baycrest / Wikimedia Commons", intro: "预留约 80–90 分钟进站、安检、找检票口和买早餐，10:29 从大连北站离开。", tip: "西安路乘地铁 1 号线往姚家方向直达；若地铁异常，立即改打车，不再安排早餐店绕行。", address: "大连市甘井子区华北路" },
];

const dalianRoutes: RouteInfo[] = [
  { id: "dl-r11", day: 1, from: "大连北站", to: "西安路酒店", method: "地铁 1 号线", duration: "约 35–45 分钟", note: "大连北站上车，往河口方向至西安路站；不用换乘。" },
  { id: "dl-r12", day: 1, from: "西安路酒店", to: "老大连海鲜晚餐", method: "步行", duration: "约 10–15 分钟", note: "先在线确认营业与排队情况；等位太久就换西安路附近同类店。" },
  { id: "dl-r13", day: 1, from: "老大连海鲜晚餐", to: "西安路夜逛", method: "步行", duration: "约 10 分钟", note: "只做饭后散步，不延长到太晚。" },
  { id: "dl-r21", day: 2, from: "西安路酒店出发", to: "星海广场", method: "地铁 1 号线 + 步行", duration: "约 25 分钟", note: "从西安路到星海广场站，出站后按导航步行至海边。" },
  { id: "dl-r22", day: 2, from: "星海广场", to: "星海公园海边", method: "公交 / 打车", duration: "约 15–25 分钟", note: "不建议沿主路硬走全程；一个人打车省体力也方便。" },
  { id: "dl-r23", day: 2, from: "星海公园海边", to: "海鲜午餐", method: "步行", duration: "约 10–15 分钟", note: "餐厅以当天排队和单人套餐为准，不执着某一家网红店。" },
  { id: "dl-r24", day: 2, from: "海鲜午餐", to: "回酒店休息", method: "地铁 1 号线", duration: "约 25 分钟", note: "14:30 前回到酒店，给演唱会预留完整休息时段。" },
  { id: "dl-r25", day: 2, from: "回酒店休息", to: "薛之谦·万兽之王", method: "地铁 2 号线", duration: "约 35–45 分钟", note: "西安路站往大连北站方向，体育中心站下车；17:15 左右到场最稳妥。" },
  { id: "dl-r31", day: 3, from: "酒店退房", to: "大连北站返程", method: "地铁 1 号线", duration: "约 35–45 分钟", note: "08:20 前进站，往姚家方向坐到大连北站；不换乘。" },
];

const checklistGroups = [
  { title: "证件与订单", items: [
    { id: "passport", label: "护照与韩国签证 / 电子签证打印件", note: "原件放随身包内层，护照首页另存手机与云端。" },
    { id: "tickets", label: "去程机票与返程船票", note: "重点核对 10/6 码头、开船及最晚报到时间。" },
    { id: "hotel", label: "酒店订单与韩文地址离线截图", note: "同时保存酒店电话。" },
    { id: "insurance", label: "旅行保险与紧急联系方式", note: "重点看医疗、航班和行李保障。" },
  ]},
  { title: "手机、网络与支付", items: [
    { id: "sim", label: "韩国实体 SIM", note: "国行 iPhone 16 Pro 不把方案建立在 eSIM 上。" },
    { id: "apps", label: "Naver Map、Kakao T、Papago", note: "出发前登录并保存酒店、码头韩文名称。" },
    { id: "card", label: "实体 Visa / Mastercard", note: "提前确认境外可用，不只依赖 Apple Pay。" },
    { id: "cash", label: "每人 ₩100,000–200,000 现金", note: "用于小店、交通卡充值与应急。" },
    { id: "tmoney", label: "落地购买并充值 T-money", note: "地铁和公交均可使用，下车也要刷卡。" },
  ]},
  { title: "轻装行李", items: [
    { id: "jacket", label: "薄外套、长裤与 4 天换洗衣物", note: "10 月初偏秋季穿搭。" },
    { id: "shoes", label: "最舒服的防滑步行鞋", note: "Citywalk 体验最受鞋影响。" },
    { id: "adapter", label: "220V 两圆脚转换插头", note: "韩国常见 Type C / F 插座。" },
    { id: "power", label: "充电宝、USB-C 线与手表充电器", note: "导航、翻译和夜景拍摄耗电明显。" },
    { id: "medicine", label: "肠胃药、止痛药、创可贴", note: "处方药保留原包装与证明。" },
    { id: "rain", label: "折叠伞与轻便斜挎包", note: "随身包以有拉链、轻便为主。" },
  ]},
  { title: "实用购物", items: [
    { id: "clothes", label: "MUSINSA 基础衣物 / 首尔主题 T 恤", note: "建议 ¥80–300/件，版型合适再买。" },
    { id: "souvenir", label: "Daiso 小纪念 1–2 个", note: "传统图案钥匙扣、小袋或笔记本，轻且好带。" },
    { id: "museum", label: "顺路时买一件博物馆文创", note: "书签、地图笔记本等，不专门绕路。" },
    { id: "snacks", label: "试吃后再买少量零食", note: "海苔、薯片、饼干先买小包装。" },
  ]},
  { title: "护肤采购", items: [
    { id: "cleanser", label: "洁面：ROUND LAB 1025 Dokdo", note: "现有洁面好用就不重复买，参考约 ¥60。" },
    { id: "sunscreen", label: "防晒：ROUND LAB Birch Juice", note: "Citywalk 比多一瓶精华更需要防晒，参考约 ¥110。" },
    { id: "cream", label: "保湿霜：Torriden / AESTURA 二选一", note: "混合肌选轻薄，偏干选滋润；不要同时囤。" },
    { id: "lip", label: "按需购买润唇或面膜", note: "体验项，不为凑满预算硬买。" },
  ]},
];

const travelNotes = [
  { title: "出发前 3–7 天", body: "核对签证姓名与有效期、去程机票、返程船票、酒店订单和首尔天气；把基础行程留给家人。", icon: ShieldCheck },
  { title: "国行 iPhone 网络", body: "准备韩国实体 SIM，保留中国 SIM 接短信并关闭数据漫游。AirPods 可配合 Papago 或 Google 翻译，无需为旅行换设备。", icon: Smartphone },
  { title: "支付方案", body: "实体 Visa / Mastercard 作主力，Apple Pay 只作辅助；每人准备约 ₩100,000–200,000 韩元现金。", icon: WalletCards },
  { title: "落地仁川机场", body: "先确认 SIM 能联网，再购买 T-money。两人轻装可优先搭 6001 机场巴士去东大门，不必专门订车。", icon: Plane },
  { title: "Citywalk 穿搭", body: "10 月初准备薄外套、长裤、舒适防滑鞋和折叠伞。每天步行多，鞋和包比多带备用衣物更重要。", icon: Shirt },
  { title: "10 月 6 日坐船", body: "前一晚再次确认船公司、码头、开船与最晚报到时间；中午左右离开首尔，目标约 15:00 到仁川港。", icon: Ship },
  { title: "购物控制", body: "建议衣物、小纪念和零食约 ¥300–500/人；护肤单列预算，基础三件套约 ¥270–330，不为凑满 ¥600 硬买。", icon: ShoppingBag },
];

const dayMeta = [
  { day: 1, label: "东大门夜色", date: "10.03 · DAY 1", color: "#e65b3b" },
  { day: 2, label: "圣水与汉江", date: "10.04 · DAY 2", color: "#287f70" },
  { day: 3, label: "宫殿与骆山", date: "10.05 · DAY 3", color: "#596db7" },
  { day: 4, label: "明洞与返程", date: "10.06 · DAY 4", color: "#8b684f" },
];

const dalianChecklistGroups = [
  { title: "车票、住宿与演出票", items: [
    { id: "dl-id", label: "身份证原件", note: "坐高铁与实名观演都可能用到，放在随身包固定夹层。" },
    { id: "dl-rail", label: "往返车票截图", note: "去程 9/25 16:41 到大连北；返程 9/27 10:29 发车。" },
    { id: "dl-hotel", label: "西安路酒店订单与地址", note: "确认 9/27 早晨快速退房方式。" },
    { id: "dl-ticket", label: "9/26 演唱会电子票", note: "提前查看座位、实名人、入口和电子票夹。" },
  ]},
  { title: "演唱会随身包", items: [
    { id: "dl-phone", label: "手机与充电宝", note: "出门前充满电；充电宝容量标识清晰。" },
    { id: "dl-earplug", label: "隔音耳塞", note: "需要时降低长时间高声压带来的疲劳。" },
    { id: "dl-jacket", label: "薄外套", note: "9 月下旬海边和散场后的体感可能偏凉。" },
    { id: "dl-rain", label: "轻便雨衣", note: "如预报有雨，优先雨衣；雨伞是否可带以现场规则为准。" },
    { id: "dl-water", label: "少量纸巾与必要药品", note: "尽量少带包，液体与其他物品遵守现场安检要求。" },
  ]},
  { title: "两晚轻装", items: [
    { id: "dl-clothes", label: "两套换洗衣物", note: "演唱会当天以舒适、透气、好走为先。" },
    { id: "dl-shoes", label: "防滑运动鞋", note: "海边、地铁与散场步行都需要。" },
    { id: "dl-toiletry", label: "洗漱与护肤小样", note: "两晚不带大瓶，减少负重。" },
    { id: "dl-medicine", label: "肠胃药与创可贴", note: "海鲜不贪多，对不熟悉的生食保持谨慎。" },
  ]},
];

const dalianTravelNotes = [
  { title: "演唱会信息已核实", body: "9 月 26 日 19:30，大连体育中心体育场（甘井子区岚岭路 699 号）。不是梭鱼湾足球场。", icon: Music2 },
  { title: "提前约两小时到场", body: "建议 16:20 从酒店出发、17:15 左右抵达。留出安检、找入口、上洗手间和拍照时间。", icon: ShieldCheck },
  { title: "去场馆坐地铁 2 号线", body: "从西安路站往大连北站方向，到体育中心站下车。散场按现场导流走，临时封站和延时运营以当天公告为准。", icon: TrainFront },
  { title: "看海选星海线", body: "星海广场加星海公园足够覆盖城市地标、海湾和海边慢走；不再塞东港、老虎滩或跨城景点。", icon: Waves },
  { title: "一个人吃海鲜", body: "优先海肠捞饭、海胆水饺、烤生蚝等可单点菜。每顿一份主食加一份小海鲜，避免多人份蒸锅和过量生食。", icon: UtensilsCrossed },
  { title: "返程日上午不排景点", body: "10:29 从大连北站发车，建议 08:20 前离开酒店、09:00 左右到站，预留安检与候车时间。", icon: TrainFront },
];

const dalianDayMeta = [
  { day: 1, label: "抵达与海鲜", date: "09.25 · 周五", color: "#e96a46", distance: "轻松入住线" },
  { day: 2, label: "海边与演唱会", date: "09.26 · 周六", color: "#167d92", distance: "主行程 · 19:30 开唱" },
  { day: 3, label: "从容返程", date: "09.27 · 周日", color: "#6a6795", distance: "10:29 大连北出发" },
];

const seoulDayMeta = dayMeta.map((item) => ({ ...item, distance: "预计步行 8.6 km" }));

const tripPlans = {
  seoul: {
    id: "seoul" as const,
    storageKey: "seoul-trip-spots",
    checkedKey: "seoul-trip-checked",
    brand: "S",
    range: "2026.10.03–10.06 · 首尔",
    title: "Citywalk 夜景计划",
    sideTitle: <>首尔夜行<br />四日记</>,
    subtitle: "两位同学 · 东大门出发 · Citywalk × 城市夜景 × 美食",
    chip: "夜景 Citywalk",
    reminderLabel: "出国提醒",
    notesDescription: "根据设备、交通与返程方式整理的关键提醒。",
    infoFoot: "涉及入境与签证的内容会随政策变化。临行前请再次查看官方信息。",
    fallbackPhoto: "/seoul-triptych.png",
    defaultLat: 37.5665,
    defaultLng: 126.978,
    exportName: "seoul-trip-plan.json",
    spots: actualSpots,
    routes: actualRoutes,
    dayMeta: seoulDayMeta,
    checklistGroups,
    travelNotes,
    budget: ["普通购物", "¥300–500 / 人", "基础护肤", "约 ¥270–330", "先试、再买；不把购物变成旅行任务。"],
  },
  dalian: {
    id: "dalian" as const,
    storageKey: "dalian-trip-spots",
    checkedKey: "dalian-trip-checked",
    brand: "D",
    range: "2026.09.25–09.27 · 大连",
    title: "海边与万兽之王",
    sideTitle: <>滨城赴约<br />三日记</>,
    subtitle: "一个人 · 西安路出发 · 海边 × 海鲜 × 演唱会",
    chip: "9.26 · 19:30",
    reminderLabel: "观演提醒",
    notesDescription: "围绕演唱会、海边、海鲜与返程整理的关键提醒。",
    infoFoot: "场馆安检、入口和散场交通可能临时调整，请以电子票夹、现场广播及大连地铁当日公告为准。",
    fallbackPhoto: "/places/dalian/xinghai-square.jpg",
    defaultLat: 38.9188,
    defaultLng: 121.5935,
    exportName: "dalian-concert-trip.json",
    spots: dalianSpots,
    routes: dalianRoutes,
    dayMeta: dalianDayMeta,
    checklistGroups: dalianChecklistGroups,
    travelNotes: dalianTravelNotes,
    budget: ["两顿海鲜", "约 ¥160–300", "市内交通", "约 ¥30–80", "演唱会票价不计入；一个人吃海鲜少点勤加。"],
  },
};

export default function Home() {
  const [tripId, setTripId] = useState<TripId>(() => {
    if (typeof window === "undefined") return "seoul";
    return window.localStorage.getItem("active-trip") === "dalian" ? "dalian" : "seoul";
  });
  const trip = tripPlans[tripId];
  const [spots, setSpots] = useState<Spot[]>(() => {
    const initialId: TripId = typeof window !== "undefined" && window.localStorage.getItem("active-trip") === "dalian" ? "dalian" : "seoul";
    const initialTrip = tripPlans[initialId];
    if (typeof window === "undefined") return initialTrip.spots;
    const saved = window.localStorage.getItem(initialTrip.storageKey);
    if (!saved) return initialTrip.spots;
    try {
      const parsed = JSON.parse(saved) as Spot[];
      return parsed.map((spot) => {
        const source = initialTrip.spots.find((entry) => entry.id === spot.id);
        return source ? {
          ...spot,
          lat: source.lat,
          lng: source.lng,
          photo: source.photo,
          photoSource: source.photoSource,
          photoCredit: source.photoCredit,
        } : spot;
      });
    } catch { return initialTrip.spots; }
  });
  const [activeDay, setActiveDay] = useState(1);
  const [selected, setSelected] = useState<Spot | RouteInfo | null>(null);
  const [panel, setPanel] = useState<"packing" | "notes" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const initialId: TripId = window.localStorage.getItem("active-trip") === "dalian" ? "dalian" : "seoul";
    const saved = window.localStorage.getItem(tripPlans[initialId].checkedKey);
    if (!saved) return [];
    try { return JSON.parse(saved) as string[]; } catch { return []; }
  });
  const [toast, setToast] = useState("");
  const [focusNonce, setFocusNonce] = useState(0);

  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await modelContext.registerTool({
        name: "add_trip_spot",
        title: "添加旅行地点",
        description: "把一个地点添加到指定天的旅行地图，并保存到当前设备。",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            day: { type: "integer", minimum: 1, maximum: trip.dayMeta.length },
            time: { type: "string" },
            tip: { type: "string" },
          },
          required: ["name", "day"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = input as { name?: unknown; day?: unknown; time?: unknown; tip?: unknown };
          if (typeof value.name !== "string" || !value.name.trim() || !Number.isInteger(value.day) || Number(value.day) < 1 || Number(value.day) > trip.dayMeta.length) throw new Error(`name 必须为非空文本，day 必须是 1–${trip.dayMeta.length} 的整数`);
          const day = Number(value.day);
          setSpots((current) => {
            const created: Spot = { id: `agent-${Date.now()}`, day, order: current.filter((spot) => spot.day === day).length + 1, name: value.name!.toString().trim(), korean: "待补充", type: "景点", time: typeof value.time === "string" ? value.time : "待定", stay: "1小时", x: 50, y: 45, photoPosition: "center", photo: trip.fallbackPhoto, intro: "通过行程工具添加的地点。", tip: typeof value.tip === "string" ? value.tip : "出发前确认开放时间与交通。", address: "待补充地址" };
            const next = [...current, created];
            window.localStorage.setItem(trip.storageKey, JSON.stringify(next));
            return next;
          });
          setActiveDay(day);
          return { success: true, name: value.name.trim(), day };
        },
      }, { signal: lifecycle.signal });
    };
    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, [trip]);

  const daySpots = useMemo(() => spots.filter((spot) => spot.day === activeDay).sort((a, b) => a.order - b.order), [spots, activeDay]);
  // Keep the route collection stable while opening sheets or other UI state changes.
  // TripMap only refits the camera when the active day (or itinerary) actually changes.
  const dayRoutes = useMemo(() => trip.routes.filter((route) => route.day === activeDay), [activeDay, trip.routes]);
  const currentDay = trip.dayMeta[activeDay - 1];
  const checklistTotal = trip.checklistGroups.reduce((total, group) => total + group.items.length, 0);
  const selectedSpot = selected && "type" in selected ? selected : null;
  const selectedRoute = selected && "method" in selected ? selected : null;

  function persist(next: Spot[]) {
    setSpots(next);
    window.localStorage.setItem(trip.storageKey, JSON.stringify(next));
    showToast("行程已保存在这台设备");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function togglePacked(item: string, value: boolean) {
    const next = value ? [...checked, item] : checked.filter((entry) => entry !== item);
    setChecked(next);
    window.localStorage.setItem(trip.checkedKey, JSON.stringify(next));
  }

  function switchTrip(nextId: TripId) {
    if (nextId === tripId) return;
    const nextTrip = tripPlans[nextId];
    let nextSpots = nextTrip.spots;
    let nextChecked: string[] = [];
    try {
      const savedSpots = window.localStorage.getItem(nextTrip.storageKey);
      if (savedSpots) nextSpots = JSON.parse(savedSpots) as Spot[];
      const savedChecked = window.localStorage.getItem(nextTrip.checkedKey);
      if (savedChecked) nextChecked = JSON.parse(savedChecked) as string[];
    } catch { /* Fall back to the published itinerary. */ }
    window.localStorage.setItem("active-trip", nextId);
    setTripId(nextId);
    setSpots(nextSpots);
    setChecked(nextChecked);
    setActiveDay(1);
    setSelected(null);
    setPanel(null);
    setMenuOpen(false);
    setFocusNonce((value) => value + 1);
  }

  function saveSpot(form: FormData) {
    const existing = selectedSpot;
    const nextSpot: Spot = {
      id: existing?.id ?? `custom-${Date.now()}`,
      day: Number(form.get("day")),
      order: existing?.order ?? spots.filter((s) => s.day === Number(form.get("day"))).length + 1,
      name: String(form.get("name")),
      korean: String(form.get("korean") || "自定义地点"),
      type: String(form.get("type")) as Spot["type"],
      time: String(form.get("time") || "待定"),
      stay: String(form.get("stay") || "1小时"),
      x: existing?.x ?? 50 + Math.round(Math.random() * 18 - 9),
      y: existing?.y ?? 45 + Math.round(Math.random() * 18 - 9),
      lat: Number(form.get("lat")) || existing?.lat || trip.defaultLat,
      lng: Number(form.get("lng")) || existing?.lng || trip.defaultLng,
      photoPosition: existing?.photoPosition ?? "center",
      photo: existing?.photo ?? trip.fallbackPhoto,
      photoSource: existing?.photoSource,
      photoCredit: existing?.photoCredit,
      intro: String(form.get("intro") || "还没有备注。"),
      tip: String(form.get("tip") || "出发前确认开放时间与交通。"),
      address: String(form.get("address") || "待补充地址"),
    };
    const next = existing ? spots.map((spot) => spot.id === existing.id ? nextSpot : spot) : [...spots, nextSpot];
    persist(next);
    setEditOpen(false);
    setSelected(nextSpot);
    setActiveDay(nextSpot.day);
  }

  function exportPlan() {
    const blob = new Blob([JSON.stringify({ title: trip.title, trip: trip.id, spots }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = trip.exportName;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("行程文件已导出");
  }

  return (
    <main className="trip-shell">
      <header className="topbar">
        <div className="brand-mark">{trip.brand}</div>
        <div className="trip-title">
          <span>{trip.range}</span>
          <strong>{trip.title}</strong>
        </div>
        <div className="trip-switch" role="group" aria-label="切换旅行计划">
          <button className={tripId === "seoul" ? "active" : ""} onClick={() => switchTrip("seoul")}>首尔</button>
          <button className={tripId === "dalian" ? "active" : ""} onClick={() => switchTrip("dalian")}>大连</button>
        </div>
        <div className="weather-chip"><CloudSun size={18} /><span><b>{trip.chip}</b></span></div>
        <button className="icon-btn mobile-only" aria-label="打开菜单" onClick={() => setMenuOpen(true)}><Menu /></button>
      </header>

      <aside className="desktop-sidebar">
        <div className="side-intro"><span>MY TRIP</span><h1>{trip.sideTitle}</h1><p>{trip.subtitle}</p></div>
        <nav className="side-days" aria-label="选择行程日期">
          {trip.dayMeta.map((meta) => (
            <button key={meta.day} className={activeDay === meta.day ? "active" : ""} onClick={() => setActiveDay(meta.day)}>
              <span style={{ background: meta.color }}>{meta.day}</span><div><b>{meta.date}</b><small>{meta.label}</small></div><ChevronRight />
            </button>
          ))}
        </nav>
        <div className="side-tools">
          <button onClick={() => setPanel("notes")}><CircleAlert />{trip.reminderLabel}</button>
          <button onClick={() => setPanel("packing")}><ShoppingBag />备忘与购物 <span>{checked.length}/{checklistTotal}</span></button>
          <button onClick={() => { setSelected(null); setEditOpen(true); }}><Plus />添加地点</button>
          <button onClick={exportPlan}><Download />导出行程</button>
        </div>
        <div className="safety-card"><Sparkles /><div><b>今日小提醒</b><p>{tripId === "dalian" ? "演唱会在大连体育中心体育场，不是梭鱼湾；按电子票入口进场。" : "保存酒店韩文地址截图，迷路时比口头描述更有效。"}</p></div></div>
      </aside>

      <section className="map-workspace" aria-label={`第 ${activeDay} 天地图`}>
        <div className="map-toolbar">
          <div className="day-heading"><span>{currentDay.date}</span><h2>{currentDay.label}</h2><p>{daySpots.length} 个地点 · {currentDay.distance}</p></div>
          <div className="map-actions">
            <button onClick={() => setFocusNonce((value) => value + 1)}><LocateFixed />显示全程</button>
            <button className="primary" onClick={() => { setSelected(null); setEditOpen(true); }}><Plus />添加地点</button>
          </div>
        </div>

        <div className="map-canvas">
          <TripMap
            spots={daySpots}
            routes={dayRoutes}
            color={currentDay.color}
            focusNonce={focusNonce}
            onSpotSelect={(mapSpot) => { const spot = daySpots.find((entry) => entry.id === mapSpot.id); if (spot) setSelected(spot); }}
            onRouteSelect={(index) => { const route = dayRoutes[index]; if (route) setSelected(route); }}
          />
          <div className="map-status"><span style={{ background: "#0a84ff" }} /><div><b>真实地图与道路路线</b><small>拖动、双指缩放；点标记或蓝色路线查看详情</small></div></div>
        </div>

        <div className="mobile-day-strip" aria-label="切换日期" style={{ gridTemplateColumns: `repeat(${trip.dayMeta.length}, minmax(0, 1fr))` }}>
          {trip.dayMeta.map((meta) => <button key={meta.day} className={activeDay === meta.day ? "active" : ""} onClick={() => setActiveDay(meta.day)}><b>D{meta.day}</b><span>{meta.label}</span></button>)}
        </div>

        <div className="timeline-peek">
          <div className="peek-title"><span>今天的路线</span><button onClick={() => setPanel("notes")}>{trip.reminderLabel} <ChevronRight /></button></div>
          <div className="spot-cards">
            {daySpots.map((spot) => <button key={spot.id} onClick={() => setSelected(spot)}><span className="time">{spot.time}</span><div className="mini-photo" style={{ backgroundImage: `url(${spot.photo ?? trip.fallbackPhoto})` }}><span>{spot.order}</span></div><div><b>{spot.name}</b><small>{spot.korean} · {spot.stay}</small></div></button>)}
          </div>
        </div>
      </section>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="detail-sheet">
          {selectedSpot && <>
            <div className="detail-photo" style={{ backgroundImage: `url(${selectedSpot.photo ?? trip.fallbackPhoto})` }}><span className="type-pill"><MapPin />{selectedSpot.type}</span></div>
            <SheetHeader className="detail-head"><div><SheetTitle>{selectedSpot.name}</SheetTitle><SheetDescription>{selectedSpot.korean} · {selectedSpot.address}</SheetDescription></div><span className="order-badge">D{selectedSpot.day} · {selectedSpot.order}</span></SheetHeader>
            <div className="detail-content">
              <div className="detail-facts"><span><Clock3 />{selectedSpot.time} 到达</span><span><Footprints />停留 {selectedSpot.stay}</span></div>
              <p>{selectedSpot.intro}</p>
              {selectedSpot.photoSource && <a className="photo-source" href={selectedSpot.photoSource} target="_blank" rel="noreferrer">照片来源：{selectedSpot.photoCredit ?? "查看原图"}</a>}
              <div className="tip-box"><CircleAlert /><div><b>旅行提示</b><p>{selectedSpot.tip}</p></div></div>
              <button className="edit-button" onClick={() => setEditOpen(true)}><Edit3 />编辑这个地点</button>
            </div>
          </>}
          {selectedRoute && <>
            <SheetHeader className="route-detail-head"><span className="route-icon"><TrainFront /></span><div><SheetTitle>{selectedRoute.from} → {selectedRoute.to}</SheetTitle><SheetDescription>点击地图上的路线随时查看交通建议</SheetDescription></div></SheetHeader>
            <div className="detail-content">
              <div className="route-summary"><div><span>推荐方式</span><b>{selectedRoute.method}</b></div><div><span>预计用时</span><b>{selectedRoute.duration}</b></div></div>
              <div className="tip-box"><CircleAlert /><div><b>途中注意</b><p>{selectedRoute.note}</p></div></div>
            </div>
          </>}
        </SheetContent>
      </Sheet>

      <Sheet open={!!panel} onOpenChange={(open) => !open && setPanel(null)}>
        <SheetContent side="right" className="info-sheet">
          <SheetHeader><SheetTitle>{panel === "packing" ? "备忘与随身清单" : trip.reminderLabel}</SheetTitle><SheetDescription>{panel === "packing" ? `已准备 ${checked.length} / ${checklistTotal} 项，勾选会自动保存在本机。` : trip.notesDescription}</SheetDescription></SheetHeader>
          {panel === "packing" ? <div className="packing-groups">{trip.checklistGroups.map((group) => <section key={group.title}><h3>{group.title}</h3><div className="packing-list">{group.items.map((item) => <label key={item.id}><Checkbox checked={checked.includes(item.id)} onCheckedChange={(value) => togglePacked(item.id, value === true)} /><span className={checked.includes(item.id) ? "done" : ""}><b>{item.label}</b><small>{item.note}</small></span></label>)}</div></section>)}<div className="shopping-budget"><b>建议预留预算</b><div><span>{trip.budget[0]}<em>{trip.budget[1]}</em></span><span>{trip.budget[2]}<em>{trip.budget[3]}</em></span></div><p>{trip.budget[4]}</p></div></div> : <div className="notes-list">{trip.travelNotes.map(({ title, body, icon: Icon }) => <article key={title}><Icon /><div><b>{title}</b><p>{body}</p></div></article>)}</div>}
          <div className="info-foot"><Info /><p>{trip.infoFoot}</p></div>
        </SheetContent>
      </Sheet>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="menu-sheet"><SheetHeader><SheetTitle>行程工具</SheetTitle><SheetDescription>管理与备份你的旅行计划</SheetDescription></SheetHeader><div className="menu-list"><button onClick={() => { setMenuOpen(false); setPanel("notes"); }}><CircleAlert />{trip.reminderLabel}<ChevronRight /></button><button onClick={() => { setMenuOpen(false); setPanel("packing"); }}><ShoppingBag />备忘与清单<ChevronRight /></button><button onClick={() => { setMenuOpen(false); setSelected(null); setEditOpen(true); }}><Plus />添加地点<ChevronRight /></button><button onClick={exportPlan}><Download />导出 JSON 行程<ChevronRight /></button><label className="fake-upload"><Upload />导入行程文件<input type="file" accept=".json" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)); if (Array.isArray(data.spots)) { persist(data.spots); setMenuOpen(false); } else throw new Error(); } catch { showToast("暂时只支持本站导出的 JSON 文件"); } }; reader.readAsText(file); }} /><ChevronRight /></label></div><div className="import-note"><Check /><div><b>首尔与大连计划均已整理</b><p>顶部切换开关会分别保存两份行程与勾选状态。</p></div></div></SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="edit-dialog"><DialogHeader><DialogTitle>{selectedSpot ? "编辑地点" : "添加一个地点"}</DialogTitle><DialogDescription>先记录必要信息；地图位置之后也可以继续微调。</DialogDescription></DialogHeader><form action={saveSpot}>
          <div className="form-grid"><label><span>地点名称</span><input name="name" required defaultValue={selectedSpot?.name} placeholder="例如：新景点" /></label><label><span>当地名称 / 备注</span><input name="korean" defaultValue={selectedSpot?.korean} placeholder="可稍后补充" /></label><label><span>第几天</span><select name="day" defaultValue={selectedSpot?.day ?? activeDay}>{trip.dayMeta.map((meta) => <option key={meta.day} value={meta.day}>DAY {meta.day}</option>)}</select></label><label><span>类型</span><select name="type" defaultValue={selectedSpot?.type ?? "景点"}><option>景点</option><option>美食</option><option>购物</option><option>酒店</option><option>演出</option></select></label><label><span>到达时间</span><input name="time" type="time" defaultValue={selectedSpot?.time === "待定" ? "" : selectedSpot?.time} /></label><label><span>建议停留</span><input name="stay" defaultValue={selectedSpot?.stay} placeholder="例如：2小时" /></label><label><span>纬度</span><input name="lat" type="number" step="any" defaultValue={selectedSpot?.lat ?? trip.defaultLat} /></label><label><span>经度</span><input name="lng" type="number" step="any" defaultValue={selectedSpot?.lng ?? trip.defaultLng} /></label><label className="full"><span>地址</span><input name="address" defaultValue={selectedSpot?.address} placeholder="街道或当地地址" /></label><label className="full"><span>地点介绍</span><textarea name="intro" defaultValue={selectedSpot?.intro} placeholder="为什么值得去？" /></label><label className="full"><span>旅行提示</span><textarea name="tip" defaultValue={selectedSpot?.tip} placeholder="开放时间、预约、避坑等" /></label></div><button className="save-button" type="submit"><Save />保存到行程</button>
        </form></DialogContent>
      </Dialog>

      {toast && <div className="toast-message"><Check />{toast}</div>}
    </main>
  );
}
