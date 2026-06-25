export type Npc = {
  id: string;
  name: string; // 表示名
  role: string; // 英語ロールタグ
  skin: string;
  top: string; // スーツのジャケット色
  bottom: string; // スラックス色
  hair: string;
  tie: string; // ネクタイ色
  glasses?: boolean;
  beard?: boolean;
  accessory?: "none" | "headphones" | "beret" | "cap" | "long";
  pos: [number, number]; // x, z
  ry: number;
  lines: string[];
};

// 株式会社木まぐれの「想い」を、近未来オフィスを案内する社員たちの言葉に。
export const NPCS: Npc[] = [
  {
    id: "nagi",
    name: "受付ガイド・ナギ",
    role: "RECEPTION",
    skin: "#f0c79f",
    top: "#3c4654",
    bottom: "#2b333d",
    hair: "#5b3a24",
    tie: "#d9a514",
    accessory: "long",
    pos: [-5.5, 7.5],
    ry: 0.4,
    lines: [
      "ようこそ、株式会社木まぐれへ。受付ガイドのナギです。",
      "社名には「〜気になる木〜」という副題があるんです。",
      "一人ひとりが一本の木。根を張り、幹を太くし、実を育てるように成長していく——そんな会社です。",
      "木は人の成長、実は成果や価値、気まぐれは自由に選んでいい人生、そして次の世代へ価値が巡っていく。",
      "社内を歩いて、メンバーに話しかけてみてください。みんなと話すと、木まぐれの想いが見えてきますよ。",
    ],
  },
  {
    id: "miki",
    name: "エンジニア・ミキ",
    role: "ENGINEER",
    skin: "#e2a87a",
    top: "#27384e",
    bottom: "#1d2730",
    hair: "#1a1a1a",
    tie: "#2f9cc0",
    glasses: true,
    accessory: "headphones",
    pos: [8, 1.5],
    ry: -0.6,
    lines: [
      "やあ、エンジニアのミキ。プロダクトの幹を支えてる。",
      "木まぐれの理念はね——「人が根を伸ばし、自分らしく枝を広げ、未来へ価値を実らせる社会をつくる」。",
      "木の成長を、人の成長になぞらえているんだ。",
      "自由な選択と、価値が巡っていくこと。その両方を、技術でまるごと肯定したいんだよ。",
    ],
  },
  {
    id: "sora",
    name: "デザイナー・ソラ",
    role: "DESIGNER",
    skin: "#eec19a",
    top: "#4a3a5e",
    bottom: "#2c2438",
    hair: "#d6478a",
    tie: "#b07ae0",
    accessory: "beret",
    pos: [-8, -0.5],
    ry: 0.3,
    lines: [
      "こんにちは、デザイナーのソラです。いつも空の先の未来を描いているの。",
      "わたしたちのビジョンは——自分らしい選択が尊重され、まわりの人が幸せに満ちる社会。",
      "そして、子どもたちに明るい未来が育まれること。",
      "一人の成長が、まわりの幸福へ広がって、次の世代が安心して未来を描ける。そんな状態を目指しているんだ。",
    ],
  },
  {
    id: "tsudoi",
    name: "コミュニティ・ツドイ",
    role: "COMMUNITY",
    skin: "#e2a87a",
    top: "#4a3b2a",
    bottom: "#2e251a",
    hair: "#171717",
    tie: "#e08a2c",
    beard: true,
    accessory: "cap",
    pos: [7, -6.5],
    ry: -0.9,
    lines: [
      "よう、おれはツドイ。人が集まる場をつくるのが役目だ。",
      "ミッションはこう——人が集い、学び、挑戦できる場と仕組みを創り、価値の芽が育つ環境を育てる。",
      "デジタルを活かしたつながりと、体験を通じたコミュニティ。その両方を組み合わせるんだ。",
      "人と地域が、一緒に成長し合える循環をつくる。それがおれたちのやり方さ。",
    ],
  },
  {
    id: "taiju",
    name: "代表・タイジュ",
    role: "FOUNDER",
    skin: "#d8b08a",
    top: "#2a3340",
    bottom: "#1c232c",
    hair: "#b9b9b9",
    tie: "#ddc527",
    glasses: true,
    accessory: "none",
    pos: [0, -9],
    ry: 0,
    lines: [
      "よく来たね。代表のタイジュです。木まぐれが大切にする5つの価値を伝えよう。",
      "ひとつ、自分らしい選択を尊重し、自由な発想を育てる。",
      "ふたつ、小さな挑戦を積み重ね、価値の芽を継続して育てる。",
      "みっつ、仲間や社会へ目を向け、価値の循環を生む行動を選ぶ。",
      "よっつ、人が集まり、学び合い、支え合う場を大切にする。",
      "いつつ、長く根づく仕組みを育て、次世代へ実りを残す。",
      "ここまで巡ってくれてありがとう。木まぐれに想いを感じたら、ぜひ声を聞かせてほしい。",
    ],
  },
];

export const TOTAL = NPCS.length;

export const CREED: { label: string; text: string }[] = [
  { label: "木まぐれ 〜気になる木〜", text: "一人ひとりが一本の木。根を張り、実を育て、自分らしく人生を選び取る。" },
  { label: "理念", text: "人が根を伸ばし、自分らしく枝を広げ、未来へ価値を実らせる社会をつくる。" },
  { label: "ビジョン", text: "自分らしい選択が尊重され、まわりが幸せに満ち、子どもたちに明るい未来が育まれる社会へ。" },
  { label: "ミッション", text: "人が集い、学び、挑戦できる場と仕組みを創り、価値の芽が育つ環境を育てる。" },
  { label: "バリュー", text: "自由な選択を尊重／小さな挑戦を重ねる／価値の循環を生む／学び合う場を大切に／次世代へ実りを残す。" },
];

export const CONTACT_EMAIL = "info@kimagure.tech";
