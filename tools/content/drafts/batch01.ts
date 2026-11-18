/**
 * 第1弾（51語）の下書き。開発時に Claude Code が作成したもので、ユーザーのレビュー前の状態。
 * `npm run content:build-draft -- batch01` で content/words, content/questions, content/review に書き出す。
 *
 * 書式:
 *   h: 見出し語 / pos: 品詞 / ja: 日本語訳（先頭が代表訳）/ ipa: 発音（米音）/ syn: 誤答に使わない類義語
 *   ex: [例文, 例文の和訳]
 *   en2ja: 英→日の誤答に使う単語（見出し語）
 *   ja2en: 日→英の問題文と誤答
 *   cloze: 穴埋めの英文（空欄は ___）、和訳、正解の語形、誤答の語形、解説
 */
import type { DraftWord } from './types.ts'

export const dataVersion = '2026.11.0'

export const words: DraftWord[] = [
  // ---------- 名詞 ----------
  {
    h: 'invoice', pos: 'noun', ja: ['請求書', '送り状'], ipa: 'ˈɪnvɔɪs',
    ex: ['Please send the invoice to our accounting department.', '経理部に請求書を送ってください。'],
    en2ja: ['receipt', 'estimate', 'refund'],
    ja2en: { p: '請求書', d: ['receipt', 'estimate', 'refund'] },
    cloze: { s: 'The supplier sent the ___ for the office chairs we ordered last week.', ja: '先週注文した事務用いすの請求書を、業者が送ってきた。', a: 'invoice', d: ['applicant', 'deadline', 'facility'], why: '注文した品物について業者が送ってくるのは「請求書」です。' },
  },
  {
    h: 'receipt', pos: 'noun', ja: ['領収書', 'レシート'], ipa: 'rɪˈsiːt',
    ex: ['Keep the receipt in case you need to return the item.', '商品を返品する場合に備えて、領収書を保管してください。'],
    en2ja: ['invoice', 'discount', 'budget'],
    ja2en: { p: '領収書', d: ['invoice', 'refund', 'estimate'] },
    cloze: { s: 'To get a refund, please bring the item and the original ___ to the store.', ja: '返金を受けるには、商品と元の領収書を店に持ってきてください。', a: 'receipt', d: ['deadline', 'revenue', 'applicant'], why: '返金の手続きで商品と一緒に持参するのは「領収書（レシート）」です。' },
  },
  {
    h: 'estimate', pos: 'noun', ja: ['見積もり', '見積書'], ipa: 'ˈestɪmət',
    ex: ['The contractor gave us an estimate for the repair work.', '業者は修理作業の見積もりを出してくれた。'],
    en2ja: ['invoice', 'receipt', 'revenue'],
    ja2en: { p: '見積もり', d: ['invoice', 'receipt', 'budget'] },
    cloze: { s: 'Before we accept the offer, could you send us a written ___ of the total cost?', ja: '申し出を受ける前に、総費用の見積もりを書面で送っていただけますか。', a: 'estimate', d: ['shipment', 'applicant', 'facility'], why: '契約前に「総費用」について書面で出してもらうものは「見積もり」です。名詞の estimate は「見積もり」、動詞では「見積もる」の意味になります。' },
  },
  {
    h: 'refund', pos: 'noun', ja: ['返金', '払い戻し'], ipa: 'ˈriːfʌnd',
    ex: ['Customers can ask for a full refund within 30 days.', '顧客は30日以内なら全額返金を求めることができる。'],
    en2ja: ['discount', 'invoice', 'budget'],
    ja2en: { p: '返金', d: ['discount', 'receipt', 'revenue'] },
    cloze: { s: 'The concert was canceled, so all ticket holders will receive a full ___.', ja: 'コンサートが中止になったので、チケットを持っている人は全員、全額の返金を受ける。', a: 'refund', d: ['deadline', 'department', 'inventory'], why: '中止になったイベントのチケット代は「返金（払い戻し）」されます。a full refund で「全額返金」です。' },
  },
  {
    h: 'client', pos: 'noun', ja: ['顧客', '依頼人'], ipa: 'ˈklaɪənt',
    ex: ['She is meeting an important client this afternoon.', '彼女は今日の午後、大切な顧客と会う予定だ。'],
    en2ja: ['applicant', 'supplier', 'department'],
    ja2en: { p: '顧客', d: ['supplier', 'applicant', 'department'] },
    cloze: { s: 'The sales team took the ___ out to dinner to celebrate the new deal.', ja: '営業チームは新しい取引を祝って、顧客を夕食に連れて行った。', a: 'client', d: ['inventory', 'revenue', 'deadline'], why: '取引成立を祝って夕食に連れて行く相手は「顧客」です。物や数値を表す他の選択肢は人を連れて行く対象になりません。' },
  },
  {
    h: 'supplier', pos: 'noun', ja: ['供給業者', '仕入れ先'], ipa: 'səˈplaɪər',
    ex: ['We are looking for a new supplier of paper products.', '当社は紙製品の新しい仕入れ先を探している。'],
    en2ja: ['client', 'applicant', 'facility'],
    ja2en: { p: '供給業者、仕入れ先', d: ['client', 'applicant', 'department'] },
    cloze: { s: 'The factory had to stop production because its ___ could not deliver the parts on time.', ja: '仕入れ先が部品を期日どおりに納品できなかったため、工場は生産を止めなければならなかった。', a: 'supplier', d: ['applicant', 'budget', 'receipt'], why: '工場に部品を納品する立場にあるのは「供給業者（仕入れ先）」です。' },
  },
  {
    h: 'budget', pos: 'noun', ja: ['予算'], ipa: 'ˈbʌdʒɪt',
    ex: ['The project was finished on time and within budget.', 'そのプロジェクトは予定どおり、予算内で完了した。'],
    en2ja: ['revenue', 'discount', 'deadline'],
    ja2en: { p: '予算', d: ['revenue', 'estimate', 'invoice'] },
    cloze: { s: 'The marketing department has a limited ___, so we cannot run TV ads this year.', ja: 'マーケティング部は予算が限られているので、今年はテレビ広告を出せない。', a: 'budget', d: ['shipment', 'applicant', 'receipt'], why: '「限られているので広告を出せない」とあるので、使えるお金の枠である「予算」が入ります。' },
  },
  {
    h: 'deadline', pos: 'noun', ja: ['締め切り', '期限'], ipa: 'ˈdedlaɪn',
    ex: ['The deadline for applications is March 31.', '応募の締め切りは3月31日だ。'],
    en2ja: ['budget', 'contract', 'discount'],
    ja2en: { p: '締め切り、期限', d: ['budget', 'contract', 'shipment'] },
    cloze: { s: 'Please send your report by Friday, as the ___ cannot be changed.', ja: '期限は変更できないので、金曜日までに報告書を送ってください。', a: 'deadline', d: ['revenue', 'facility', 'receipt'], why: '「金曜日までに」「変更できない」とあるので、期日を表す「締め切り」が入ります。' },
  },
  {
    h: 'contract', pos: 'noun', ja: ['契約', '契約書'], ipa: 'ˈkɑːntrækt',
    ex: ['Both companies signed a three-year contract.', '両社は3年契約に署名した。'],
    en2ja: ['invoice', 'estimate', 'deadline'],
    ja2en: { p: '契約（書）', d: ['invoice', 'receipt', 'estimate'] },
    cloze: { s: 'Please read the ___ carefully before you sign it.', ja: '署名する前に、契約書をよく読んでください。', a: 'contract', d: ['revenue', 'shipment', 'facility'], why: '署名（sign）する前によく読む書類は「契約書」です。' },
  },
  {
    h: 'department', pos: 'noun', ja: ['部署', '部門'], ipa: 'dɪˈpɑːrtmənt',
    ex: ['He works in the sales department.', '彼は営業部で働いている。'],
    en2ja: ['facility', 'client', 'budget'],
    ja2en: { p: '部署、部門', d: ['facility', 'client', 'inventory'] },
    cloze: { s: 'If you have questions about your salary, please contact the accounting ___.', ja: '給与について質問があれば、経理部に連絡してください。', a: 'department', d: ['receipt', 'refund', 'applicant'], why: 'accounting department で「経理部」です。給与の問い合わせ先になる組織を表します。' },
  },
  {
    h: 'facility', pos: 'noun', ja: ['施設', '設備'], ipa: 'fəˈsɪləti',
    ex: ['The hotel has excellent sports facilities.', 'そのホテルには優れたスポーツ施設がある。'],
    en2ja: ['department', 'inventory', 'contract'],
    ja2en: { p: '施設、設備', d: ['department', 'inventory', 'shipment'] },
    cloze: { s: 'The company is building a new research ___ near the airport.', ja: 'その会社は空港の近くに新しい研究施設を建設している。', a: 'facility', d: ['deadline', 'receipt', 'revenue'], why: '「建設している（building）」対象になるのは建物である「施設」です。' },
  },
  {
    h: 'inventory', pos: 'noun', ja: ['在庫', '在庫品', '目録'], ipa: 'ˈɪnvəntɔːri',
    ex: ['The store checks its inventory every month.', 'その店は毎月、在庫を確認している。'],
    en2ja: ['shipment', 'revenue', 'facility'],
    ja2en: { p: '在庫', d: ['shipment', 'revenue', 'discount'] },
    cloze: { s: 'We need to count the ___ in the warehouse before we order more products.', ja: '商品を追加注文する前に、倉庫の在庫を数える必要がある。', a: 'inventory', d: ['deadline', 'applicant', 'refund'], why: '倉庫（warehouse）にあり、追加注文の前に数えるものは「在庫」です。' },
  },
  {
    h: 'shipment', pos: 'noun', ja: ['発送品', '積み荷', '発送'], ipa: 'ˈʃɪpmənt',
    ex: ['The shipment arrived two days late.', '積み荷は2日遅れで届いた。'],
    en2ja: ['inventory', 'refund', 'discount'],
    ja2en: { p: '発送品、積み荷', d: ['inventory', 'invoice', 'receipt'] },
    cloze: { s: 'The ___ of new laptops is expected to arrive at our warehouse on Monday.', ja: '新しいノートパソコンの発送品は、月曜日に当社の倉庫に届く予定だ。', a: 'shipment', d: ['budget', 'deadline', 'applicant'], why: '倉庫に「届く（arrive）」のは送られてくる品物、つまり「発送品」です。' },
  },
  {
    h: 'applicant', pos: 'noun', ja: ['応募者', '志願者'], ipa: 'ˈæplɪkənt',
    ex: ['More than 100 applicants applied for the position.', '100人以上の応募者がその職に応募した。'],
    en2ja: ['client', 'supplier', 'department'],
    ja2en: { p: '応募者、志願者', d: ['client', 'supplier', 'facility'] },
    cloze: { s: 'Each ___ for the position must send us a résumé and two references.', ja: 'その職への応募者は、各自が履歴書と推薦状2通を送らなければならない。', a: 'applicant', d: ['supplier', 'facility', 'budget'], why: '職（position）に対して履歴書を送るのは「応募者」です。' },
  },
  {
    h: 'revenue', pos: 'noun', ja: ['収益', '歳入'], ipa: 'ˈrevənuː',
    ex: ["The company's revenue increased by 10 percent last year.", 'その会社の収益は昨年10パーセント増えた。'],
    en2ja: ['budget', 'discount', 'refund'],
    ja2en: { p: '収益', d: ['budget', 'discount', 'invoice'] },
    cloze: { s: 'Thanks to strong sales overseas, our annual ___ reached a record high.', ja: '海外での好調な売り上げのおかげで、当社の年間収益は過去最高に達した。', a: 'revenue', d: ['applicant', 'deadline', 'facility'], why: '売り上げが好調な結果として「過去最高に達する」のは、会社に入るお金である「収益」です。' },
  },
  {
    h: 'discount', pos: 'noun', ja: ['割引'], ipa: 'ˈdɪskaʊnt',
    ex: ['Members receive a 15 percent discount on all items.', '会員は全商品が15パーセント割引になる。'],
    en2ja: ['refund', 'receipt', 'revenue'],
    ja2en: { p: '割引', d: ['refund', 'receipt', 'revenue'] },
    cloze: { s: 'Customers who order before Friday will get a 20 percent ___ on their purchase.', ja: '金曜日までに注文した客は、購入品が20パーセント割引になる。', a: 'discount', d: ['deadline', 'revenue', 'inventory'], why: '「20パーセント」と組み合わせて購入品にかかるものは「割引」です。' },
  },

  // ---------- 動詞 ----------
  {
    h: 'submit', pos: 'verb', ja: ['提出する'], ipa: 'səbˈmɪt',
    ex: ['All employees must submit their travel expenses by the end of the month.', '全従業員は月末までに出張経費を提出しなければならない。'],
    en2ja: ['confirm', 'approve', 'postpone'],
    ja2en: { p: '提出する', d: ['confirm', 'approve', 'announce'] },
    cloze: { s: 'Applicants must ___ their forms online by June 30.', ja: '応募者は6月30日までに、オンラインで書類を提出しなければならない。', a: 'submit', d: ['attend', 'hire', 'renovate'], why: '期日までに書類（forms）をどうするかを考えると「提出する」が入ります。' },
  },
  {
    h: 'confirm', pos: 'verb', ja: ['確認する', '確定する'], ipa: 'kənˈfɜːrm',
    ex: ['Please call the hotel to confirm your reservation.', 'ホテルに電話して予約を確認してください。'],
    en2ja: ['require', 'reserve', 'extend'],
    ja2en: { p: '（予約や事実を）確認する', d: ['reserve', 'require', 'extend'] },
    cloze: { s: 'Could you ___ that the meeting will start at 10 a.m. tomorrow?', ja: '明日の会議が午前10時に始まることを確認していただけますか。', a: 'confirm', d: ['renovate', 'hire', 'deliver'], why: 'that 節（〜ということ）を目的語にとり、意味が通るのは「確認する」です。' },
  },
  {
    h: 'require', pos: 'verb', ja: ['必要とする', '要求する'], ipa: 'rɪˈkwaɪər',
    ex: ['This job requires at least three years of experience.', 'この仕事には少なくとも3年の経験が必要だ。'],
    en2ja: ['confirm', 'purchase', 'attend'],
    ja2en: { p: '必要とする、要求する', d: ['purchase', 'attend', 'extend'] },
    cloze: { s: 'All visitors are ___ to wear a badge while in the building.', ja: '訪問者は全員、建物内では名札を着用することが求められる。', a: 'required', d: ['postponed', 'renovated', 'delivered'], why: 'be required to do で「〜することが求められる」。人を主語にして意味が通るのは required です。' },
  },
  {
    h: 'attend', pos: 'verb', ja: ['出席する', '参加する'], ipa: 'əˈtend',
    ex: ['More than 200 people attended the conference.', '200人以上がその会議に出席した。'],
    en2ja: ['announce', 'postpone', 'hire'],
    ja2en: { p: '出席する、参加する', d: ['announce', 'postpone', 'reserve'] },
    cloze: { s: "Unfortunately, I cannot ___ tomorrow's meeting because I will be on a business trip.", ja: '残念ながら、出張中のため明日の会議には出席できません。', a: 'attend', d: ['purchase', 'renovate', 'hire'], why: '出張中なので会議に「出席できない」という意味になります。attend は前置詞なしで目的語をとります。' },
  },
  {
    h: 'postpone', pos: 'verb', ja: ['延期する'], ipa: 'poʊstˈpoʊn',
    ex: ['The game was postponed because of heavy rain.', 'その試合は大雨のため延期された。'],
    en2ja: ['announce', 'extend', 'approve'],
    ja2en: { p: '延期する', d: ['extend', 'reserve', 'approve'] },
    cloze: { s: 'The outdoor event has been ___ until next Saturday due to the weather forecast.', ja: '天気予報を受けて、屋外イベントは次の土曜日まで延期された。', a: 'postponed', d: ['inquired', 'hired', 'purchased'], why: '天気が理由で予定を「次の土曜日まで」ずらすので「延期する」の過去分詞 postponed です。extend（延長する）との違いに注意しましょう。' },
  },
  {
    h: 'approve', pos: 'verb', ja: ['承認する', '賛成する'], ipa: 'əˈpruːv',
    ex: ['The manager approved the new budget.', '部長は新しい予算を承認した。'],
    en2ja: ['submit', 'require', 'inquire'],
    ja2en: { p: '承認する', d: ['submit', 'confirm', 'announce'] },
    cloze: { s: 'The board of directors finally ___ the plan to open a new branch in Osaka.', ja: '取締役会はついに、大阪に新しい支店を開く計画を承認した。', a: 'approved', d: ['attended', 'inquired', 'delivered'], why: '取締役会が計画（plan）に対して行うことなので「承認した」が入ります。' },
  },
  {
    h: 'reserve', pos: 'verb', ja: ['予約する', '取っておく'], ipa: 'rɪˈzɜːrv',
    ex: ["I'd like to reserve a table for four at seven o'clock.", '7時に4人分の席を予約したいのですが。'],
    en2ja: ['purchase', 'confirm', 'deliver'],
    ja2en: { p: '予約する', d: ['purchase', 'confirm', 'deliver'] },
    cloze: { s: 'If you want a room with an ocean view, you should ___ it at least one month in advance.', ja: '海の見える部屋がよいなら、少なくとも1か月前に予約したほうがよい。', a: 'reserve', d: ['attend', 'inquire', 'hire'], why: '部屋を「前もって（in advance）」どうするかを考えると「予約する」です。' },
  },
  {
    h: 'deliver', pos: 'verb', ja: ['配達する', '届ける'], ipa: 'dɪˈlɪvər',
    ex: ['The package will be delivered tomorrow morning.', 'その荷物は明日の朝に配達される。'],
    en2ja: ['purchase', 'reserve', 'submit'],
    ja2en: { p: '配達する、届ける', d: ['purchase', 'submit', 'extend'] },
    cloze: { s: 'The furniture store will ___ the sofa to your home free of charge.', ja: 'その家具店は、ソファを無料で自宅まで配達してくれる。', a: 'deliver', d: ['require', 'attend', 'inquire'], why: 'ソファを「自宅まで（to your home）」運ぶので「配達する」です。' },
  },
  {
    h: 'hire', pos: 'verb', ja: ['雇う'], ipa: 'haɪər',
    ex: ['The restaurant plans to hire five new staff members.', 'そのレストランは新しいスタッフを5人雇う予定だ。'],
    en2ja: ['attend', 'purchase', 'approve'],
    ja2en: { p: '雇う、雇用する', d: ['attend', 'approve', 'extend'] },
    cloze: { s: 'Because business is growing, we need to ___ more sales representatives.', ja: '事業が拡大しているので、営業担当者をもっと雇う必要がある。', a: 'hire', d: ['renovate', 'postpone', 'inquire'], why: '人（営業担当者）を目的語にとり、事業拡大に合うのは「雇う」です。' },
  },
  {
    h: 'purchase', pos: 'verb', ja: ['購入する'], ipa: 'ˈpɜːrtʃəs',
    ex: ['You can purchase tickets online or at the box office.', 'チケットはオンラインかチケット売り場で購入できる。'],
    en2ja: ['deliver', 'reserve', 'hire'],
    ja2en: { p: '購入する', d: ['deliver', 'reserve', 'require'] },
    cloze: { s: 'Customers who ___ more than three items will receive a free gift.', ja: '3点以上購入した客は、無料の景品がもらえる。', a: 'purchase', d: ['attend', 'confirm', 'postpone'], why: '「3点以上の商品（items）」を目的語にとるので「購入する」です。' },
  },
  {
    h: 'renovate', pos: 'verb', ja: ['改装する', '修復する'], ipa: 'ˈrenəveɪt',
    ex: ['The hotel was renovated last year.', 'そのホテルは昨年改装された。'],
    en2ja: ['reserve', 'deliver', 'extend'],
    ja2en: { p: '（建物などを）改装する', d: ['extend', 'deliver', 'postpone'] },
    cloze: { s: 'The museum is closed this month because workers are ___ the main hall.', ja: '作業員が大ホールを改装しているため、美術館は今月閉館している。', a: 'renovating', d: ['attending', 'inquiring', 'approving'], why: '作業員（workers）が建物の一部に対して行う作業なので「改装している」です。' },
  },
  {
    h: 'inquire', pos: 'verb', ja: ['問い合わせる', '尋ねる'], ipa: 'ɪnˈkwaɪər',
    ex: ['Several customers called to inquire about the new service.', '何人かの客が、新しいサービスについて問い合わせるために電話してきた。'],
    en2ja: ['confirm', 'require', 'announce'],
    ja2en: { p: '問い合わせる', d: ['confirm', 'require', 'announce'] },
    cloze: { s: 'If you would like to ___ about job openings, please send an e-mail to our personnel office.', ja: '求人について問い合わせたい場合は、人事部にメールを送ってください。', a: 'inquire', d: ['renovate', 'purchase', 'approve'], why: 'inquire about で「〜について問い合わせる」。about と組み合わせて意味が通るのは inquire です。' },
  },
  {
    h: 'announce', pos: 'verb', ja: ['発表する', '知らせる'], ipa: 'əˈnaʊns',
    ex: ['The company announced its plans to open ten new stores.', 'その会社は10店舗を新規開店する計画を発表した。'],
    en2ja: ['approve', 'confirm', 'postpone'],
    ja2en: { p: '発表する', d: ['approve', 'postpone', 'inquire'] },
    cloze: { s: 'The president will ___ the name of the new director at the press conference.', ja: '社長は記者会見で、新しい部長の名前を発表する。', a: 'announce', d: ['require', 'renovate', 'deliver'], why: '記者会見（press conference）で名前をどうするかを考えると「発表する」です。' },
  },
  {
    h: 'extend', pos: 'verb', ja: ['延長する', '広げる'], ipa: 'ɪkˈstend',
    ex: ['The store has extended its opening hours.', 'その店は営業時間を延長した。'],
    en2ja: ['postpone', 'reserve', 'require'],
    ja2en: { p: '延長する', d: ['postpone', 'renovate', 'deliver'] },
    cloze: { s: 'Because so many people visited, the museum decided to ___ the exhibition for another month.', ja: '来場者が非常に多かったため、美術館は展示会をさらに1か月延長することにした。', a: 'extend', d: ['inquire', 'hire', 'deliver'], why: '「さらに1か月（for another month）」続けるので「延長する」です。' },
  },

  // ---------- 形容詞 ----------
  {
    h: 'various', pos: 'adj', ja: ['さまざまな', 'いろいろな'], ipa: 'ˈveriəs', syn: ['diverse'],
    ex: ['The store sells various kinds of coffee.', 'その店はさまざまな種類のコーヒーを売っている。'],
    en2ja: ['necessary', 'accurate', 'temporary'],
    ja2en: { p: 'さまざまな', d: ['necessary', 'accurate', 'temporary'] },
    cloze: { s: 'Our hotel offers ___ activities, including tennis, golf, and yoga.', ja: '当ホテルでは、テニス、ゴルフ、ヨガなど、さまざまなアクティビティを提供している。', a: 'various', d: ['eligible', 'accurate', 'reliable'], why: 'including 以下で複数の種類を挙げているので「さまざまな」が入ります。名詞の variety（多様性）も一緒に覚えましょう。' },
  },
  {
    h: 'available', pos: 'adj', ja: ['利用できる', '手が空いている', '入手できる'], ipa: 'əˈveɪləbəl',
    ex: ['The meeting room is available after 3 p.m.', '会議室は午後3時以降なら使える。'],
    en2ja: ['convenient', 'eligible', 'additional'],
    ja2en: { p: '利用できる、入手できる', d: ['convenient', 'eligible', 'efficient'] },
    cloze: { s: "I'm sorry, but Ms. Tanaka is not ___ right now because she is in a meeting.", ja: '申し訳ありませんが、田中は会議中のため、ただ今手が空いておりません。', a: 'available', d: ['annual', 'accurate', 'previous'], why: '人について使う available は「手が空いている、対応できる」の意味です。会議中なので対応できない、という文脈です。' },
  },
  {
    h: 'necessary', pos: 'adj', ja: ['必要な'], ipa: 'ˈnesəseri',
    ex: ['It is necessary to show your ID at the entrance.', '入り口で身分証を見せる必要がある。'],
    en2ja: ['available', 'various', 'efficient'],
    ja2en: { p: '必要な', d: ['available', 'various', 'additional'] },
    cloze: { s: 'Please let me know if any changes to the schedule are ___.', ja: '予定の変更が必要であれば、知らせてください。', a: 'necessary', d: ['annual', 'previous', 'eligible'], why: '「変更が〜であれば知らせて」という文なので、意味が通るのは「必要な」です。' },
  },
  {
    h: 'accurate', pos: 'adj', ja: ['正確な'], ipa: 'ˈækjərət',
    ex: ['The weather report was not very accurate.', '天気予報はあまり正確ではなかった。'],
    en2ja: ['reliable', 'efficient', 'previous'],
    ja2en: { p: '正確な', d: ['reliable', 'efficient', 'annual'] },
    cloze: { s: 'Please make sure the figures in the report are ___ before you send it to the client.', ja: '顧客に送る前に、報告書の数字が正確か確認してください。', a: 'accurate', d: ['eligible', 'annual', 'convenient'], why: '数字（figures）について確認する内容なので「正確な」です。' },
  },
  {
    h: 'temporary', pos: 'adj', ja: ['一時的な', '臨時の'], ipa: 'ˈtempəreri',
    ex: ['She found a temporary job for the summer.', '彼女は夏の間の臨時の仕事を見つけた。'],
    en2ja: ['annual', 'previous', 'additional'],
    ja2en: { p: '一時的な、臨時の', d: ['annual', 'previous', 'reliable'] },
    cloze: { s: 'The main gate is closed, so please use the ___ entrance on the east side until next week.', ja: '正門が閉まっているので、来週までは東側の臨時の入口を使ってください。', a: 'temporary', d: ['eligible', 'annual', 'accurate'], why: '「来週まで」だけ使う入口なので「臨時の、一時的な」が入ります。' },
  },
  {
    h: 'annual', pos: 'adj', ja: ['年1回の', '毎年の', '年間の'], ipa: 'ˈænjuəl',
    ex: ['The company holds its annual meeting in June.', 'その会社は年次総会を6月に開く。'],
    en2ja: ['temporary', 'previous', 'additional'],
    ja2en: { p: '年1回の、毎年の', d: ['temporary', 'previous', 'additional'] },
    cloze: { s: 'The ___ sales conference takes place every April in Tokyo.', ja: '年次営業会議は、毎年4月に東京で開かれる。', a: 'annual', d: ['accurate', 'eligible', 'convenient'], why: '「毎年4月に（every April）」開かれるので「年1回の」が入ります。' },
  },
  {
    h: 'efficient', pos: 'adj', ja: ['効率的な', '有能な'], ipa: 'ɪˈfɪʃənt',
    ex: ['The new system is more efficient than the old one.', '新しいシステムは古いものより効率的だ。'],
    en2ja: ['reliable', 'convenient', 'accurate'],
    ja2en: { p: '効率的な', d: ['reliable', 'convenient', 'accurate'] },
    cloze: { s: 'The new machine is more ___ and uses 30 percent less energy.', ja: '新しい機械はより効率的で、使う電力が30パーセント少ない。', a: 'efficient', d: ['eligible', 'previous', 'temporary'], why: '少ないエネルギーで動くことを表すので「効率的な」です。' },
  },
  {
    h: 'reliable', pos: 'adj', ja: ['信頼できる', '頼りになる'], ipa: 'rɪˈlaɪəbəl',
    ex: ['We need a reliable person to manage the project.', 'プロジェクトを管理する、信頼できる人が必要だ。'],
    en2ja: ['accurate', 'efficient', 'eligible'],
    ja2en: { p: '信頼できる', d: ['accurate', 'efficient', 'eligible'] },
    cloze: { s: 'He is a ___ worker who always finishes his tasks on time.', ja: '彼はいつも期限どおりに仕事を終える、頼りになる働き手だ。', a: 'reliable', d: ['annual', 'previous', 'convenient'], why: 'いつも期限を守る人なので「信頼できる、頼りになる」が入ります。' },
  },
  {
    h: 'previous', pos: 'adj', ja: ['以前の', '前の'], ipa: 'ˈpriːviəs',
    ex: ['I met her at the previous meeting.', '私は前回の会議で彼女に会った。'],
    en2ja: ['annual', 'temporary', 'additional'],
    ja2en: { p: '以前の、前の', d: ['annual', 'temporary', 'additional'] },
    cloze: { s: 'As I mentioned in my ___ e-mail, the meeting will be held in Room 5.', ja: '前回のメールでお伝えしたとおり、会議は5号室で開かれます。', a: 'previous', d: ['eligible', 'reliable', 'efficient'], why: '「すでに述べたとおり（As I mentioned）」とあるので、以前に送った「前回の」メールです。' },
  },
  {
    h: 'additional', pos: 'adj', ja: ['追加の'], ipa: 'əˈdɪʃənəl',
    ex: ['There is no additional charge for breakfast.', '朝食に追加料金はかからない。'],
    en2ja: ['available', 'necessary', 'annual'],
    ja2en: { p: '追加の', d: ['available', 'necessary', 'annual'] },
    cloze: { s: 'For ___ information, please visit our Web site.', ja: 'さらに詳しい情報は、当社のウェブサイトをご覧ください。', a: 'additional', d: ['eligible', 'temporary', 'previous'], why: 'For additional information で「さらに詳しい（追加の）情報は」という決まった言い方です。' },
  },
  {
    h: 'convenient', pos: 'adj', ja: ['便利な', '都合のよい'], ipa: 'kənˈviːniənt',
    ex: ['The hotel is in a convenient location near the station.', 'そのホテルは駅に近い便利な場所にある。'],
    en2ja: ['available', 'efficient', 'reliable'],
    ja2en: { p: '便利な、都合のよい', d: ['available', 'efficient', 'reliable'] },
    cloze: { s: 'Please let us know what time would be most ___ for you to visit our office.', ja: '当社にお越しいただくのに、何時がいちばんご都合がよいか教えてください。', a: 'convenient', d: ['accurate', 'annual', 'eligible'], why: '時間について「あなたにとって〜」と尋ねているので「都合のよい」が入ります。convenient は人を主語にせず、時間や場所を主語にします。' },
  },
  {
    h: 'eligible', pos: 'adj', ja: ['資格のある', '適格な'], ipa: 'ˈelɪdʒəbəl',
    ex: ['Full-time employees are eligible for the bonus.', '正社員はそのボーナスを受け取る資格がある。'],
    en2ja: ['available', 'reliable', 'necessary'],
    ja2en: { p: '資格のある、適格な', d: ['available', 'reliable', 'necessary'] },
    cloze: { s: 'Only customers who have spent more than $500 are ___ for the special discount.', ja: '500ドル以上使った顧客だけが、その特別割引を受ける資格がある。', a: 'eligible', d: ['accurate', 'annual', 'previous'], why: 'be eligible for で「〜を受ける資格がある」。条件を満たした人だけ、という文脈です。' },
  },

  // ---------- 前置詞 ----------
  {
    h: 'despite', pos: 'prep', ja: ['〜にもかかわらず'], ipa: 'dɪˈspaɪt',
    ex: ['Despite the rain, the event was a great success.', '雨にもかかわらず、そのイベントは大成功だった。'],
    en2ja: ['throughout', 'except', 'beyond'],
    ja2en: { p: '〜にもかかわらず', d: ['throughout', 'except', 'beyond'] },
    cloze: { s: 'The meeting was held as scheduled ___ the heavy snow.', ja: '大雪にもかかわらず、会議は予定どおり開かれた。', a: 'despite', d: ['although', 'unless', 'whereas'], why: '空欄の後ろは名詞（the heavy snow）だけなので、前置詞の despite が入ります。although・unless・whereas は接続詞で、後ろに主語と動詞が必要です。' },
  },
  {
    h: 'throughout', pos: 'prep', ja: ['〜の至る所に', '〜の間ずっと'], ipa: 'θruːˈaʊt',
    ex: ['The museum is open throughout the year.', 'その美術館は1年中開いている。'],
    en2ja: ['despite', 'except', 'beyond'],
    ja2en: { p: '〜の至る所に、〜の間ずっと', d: ['despite', 'except', 'beyond'] },
    cloze: { s: 'The company has more than 50 stores ___ the country.', ja: 'その会社は国中に50以上の店舗を持っている。', a: 'throughout', d: ['despite', 'except', 'although'], why: 'throughout the country で「国中に」。場所の広がりを表します。' },
  },
  {
    h: 'except', pos: 'prep', ja: ['〜を除いて', '〜以外は'], ipa: 'ɪkˈsept',
    ex: ['The office is open every day except Sunday.', '事務所は日曜日以外、毎日開いている。'],
    en2ja: ['despite', 'throughout', 'beyond'],
    ja2en: { p: '〜を除いて、〜以外は', d: ['despite', 'throughout', 'beyond'] },
    cloze: { s: 'All of the staff members ___ Mr. Lee attended the training session.', ja: 'リーさん以外のスタッフ全員が研修会に出席した。', a: 'except', d: ['despite', 'throughout', 'whereas'], why: '「全員（All）」から1人を除くので「〜以外は」の except です。' },
  },
  {
    h: 'beyond', pos: 'prep', ja: ['〜を越えて', '〜の向こうに'], ipa: 'biˈjɑːnd',
    ex: ['The cost of the project went beyond the original plan.', 'プロジェクトの費用は当初の計画を超えた。'],
    en2ja: ['despite', 'throughout', 'except'],
    ja2en: { p: '〜を越えて、〜の向こうに', d: ['despite', 'throughout', 'except'] },
    cloze: { s: 'The repair is ___ our ability, so we will call a specialist.', ja: 'その修理は私たちの能力を超えているので、専門家を呼ぶ。', a: 'beyond', d: ['despite', 'except', 'although'], why: 'be beyond one\'s ability で「〜の能力を超えている」。だから専門家を呼ぶ、という流れです。' },
  },

  // ---------- 接続詞 ----------
  {
    h: 'although', pos: 'conj', ja: ['〜だけれども'], ipa: 'ɔːlˈðoʊ',
    ex: ['Although it was late, she continued working.', '遅い時間だったが、彼女は仕事を続けた。'],
    en2ja: ['unless', 'whether', 'because'],
    ja2en: { p: '〜だけれども', d: ['unless', 'whether', 'because'] },
    cloze: { s: '___ the hotel was expensive, we enjoyed our stay very much.', ja: 'ホテルは高かったが、私たちは滞在を大いに楽しんだ。', a: 'Although', d: ['Despite', 'Unless', 'Whether'], why: '後ろに主語と動詞（the hotel was）が続き、「高かったが楽しんだ」と逆の内容をつなぐので、接続詞の Although です。Despite は前置詞なので後ろに文は続きません。' },
  },
  {
    h: 'unless', pos: 'conj', ja: ['〜でない限り', 'もし〜でなければ'], ipa: 'ənˈles',
    ex: ['We will start at 9 a.m. unless it rains.', '雨が降らない限り、午前9時に始めます。'],
    en2ja: ['although', 'whereas', 'because'],
    ja2en: { p: '〜でない限り', d: ['although', 'whereas', 'whether'] },
    cloze: { s: 'You cannot enter the building ___ you have an ID card.', ja: '身分証を持っていない限り、建物には入れません。', a: 'unless', d: ['although', 'whereas', 'despite'], why: '「身分証を持っていなければ入れない」という条件を表すので unless です。' },
  },
  {
    h: 'whereas', pos: 'conj', ja: ['〜である一方', '〜なのに対して'], ipa: 'werˈæz',
    ex: ['Some people prefer tea, whereas others prefer coffee.', '紅茶を好む人もいれば、一方でコーヒーを好む人もいる。'],
    en2ja: ['unless', 'whether', 'because'],
    ja2en: { p: '〜である一方、〜なのに対して', d: ['unless', 'whether', 'because'] },
    cloze: { s: 'Sales increased in Asia, ___ they decreased in Europe.', ja: 'アジアでは売り上げが伸びた一方、ヨーロッパでは減少した。', a: 'whereas', d: ['unless', 'whether', 'despite'], why: '「アジアでは増えた」と「ヨーロッパでは減った」を対比しているので whereas です。' },
  },
  {
    h: 'whether', pos: 'conj', ja: ['〜かどうか'], ipa: 'ˈweðər',
    ex: ["I'm not sure whether he will come to the party.", '彼がパーティーに来るかどうか、わからない。'],
    en2ja: ['although', 'unless', 'because'],
    ja2en: { p: '〜かどうか', d: ['although', 'unless', 'because'] },
    cloze: { s: 'Please let us know ___ you will be able to attend the dinner.', ja: '夕食会に出席できるかどうか、お知らせください。', a: 'whether', d: ['although', 'unless', 'despite'], why: 'let us know の目的語として「〜かどうか」を表す名詞節をつくるのは whether です。' },
  },
  {
    h: 'because', pos: 'conj', ja: ['〜なので', '〜だから'], ipa: 'bɪˈkɔːz',
    ex: ['The office was closed because the power was out.', '停電していたので、事務所は閉まっていた。'],
    en2ja: ['although', 'unless', 'whether'],
    ja2en: { p: '〜なので、〜だから', d: ['although', 'unless', 'whereas'] },
    cloze: { s: 'We moved the party indoors ___ it started to rain.', ja: '雨が降り始めたので、パーティーを屋内に移した。', a: 'because', d: ['unless', 'whereas', 'despite'], why: '「雨が降り始めた」ことが屋内に移した理由なので because です。' },
  },
]
