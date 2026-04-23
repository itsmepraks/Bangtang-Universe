// Maps album titles (MusicBrainz and English variants) to Cover Art Archive
// thumbnail URLs. Source: scripts/cache/cover-art.json.

const COVER_ART_MAP: Record<string, string> = {
    // --- School Trilogy ---
    '2 Cool 4 Skool': 'http://coverartarchive.org/release/4dbf343a-3138-4e67-bbec-7eaec8f27acd/32388694197-500.jpg',
    'O!RUL8,2?': 'http://coverartarchive.org/release/bea6cd7e-e76d-4888-854b-ab2e0eb91eac/7845831956-500.jpg',
    'Skool Luv Affair': 'http://coverartarchive.org/release/b9a377b1-342b-4626-9197-df54c8bf4e2f/7845848595-500.jpg',
    '2 COOL 4 SKOOL / O!RUL8,2?': 'http://coverartarchive.org/release/bfd12686-7304-4c2b-8d7b-d4d002834049/14574416790-500.jpg',
    'DARK&WILD': 'https://coverartarchive.org/release/d2a0e518-1f1a-4544-bc4f-da9fc19f3e43/25521306633-500.jpg',
    'Dark & Wild': 'https://coverartarchive.org/release/d2a0e518-1f1a-4544-bc4f-da9fc19f3e43/25521306633-500.jpg',
    'NO MORE DREAM': 'http://coverartarchive.org/release/8d0d0d86-eb12-45ad-bfb4-f72f4a17ce28/33096055337-500.jpg',
    'BOY IN LUV': 'http://coverartarchive.org/release/35233d0b-8669-4c9a-9512-f4bdce127dd4/10691497905-500.jpg',
    'Danger (Mo-Blue-Mix)': 'http://coverartarchive.org/release/b1532680-5790-43e4-9449-e8b85c2c7861/14867493232-500.jpg',
    'I NEED U': 'https://coverartarchive.org/release/6f7fc45e-0a9b-45fc-a9fc-d26f59550cc4/42928368392-500.jpg',
    'Danger': 'http://coverartarchive.org/release/a4edc48d-36f5-4b19-921a-a226a48b274c/10691490668-500.jpg',
    'WAKE UP': 'http://coverartarchive.org/release/e3da4d3b-3ad2-401b-8a05-aa9a184d3cd7/14574385918-500.jpg',

    // --- HYYH ---
    '화양연화 pt.1': 'http://coverartarchive.org/release/889b199e-747d-459b-8240-95fd687e90b8/10271387361-500.jpg',
    'The Most Beautiful Moment in Life Pt.1': 'http://coverartarchive.org/release/889b199e-747d-459b-8240-95fd687e90b8/10271387361-500.jpg',
    'FOR YOU': 'https://coverartarchive.org/release/be8e9f05-8676-4196-a4f4-345908885726/43018814752-500.jpg',
    '화양연화 pt.2': 'http://coverartarchive.org/release/6aa7171b-8be5-450b-b6bc-7324ca2f9988/12132875653-500.jpg',
    'The Most Beautiful Moment in Life Pt.2': 'http://coverartarchive.org/release/6aa7171b-8be5-450b-b6bc-7324ca2f9988/12132875653-500.jpg',
    'RUN': 'http://coverartarchive.org/release/2b96cbba-3914-4c9f-8e04-2fed24ae1ee0/14928673049-500.jpg',
    '화양연화 Young Forever': 'http://coverartarchive.org/release/9cc33bce-5696-477e-aee2-44fe18a595c9/13459418520-500.jpg',
    'The Most Beautiful Moment in Life: Young Forever': 'http://coverartarchive.org/release/9cc33bce-5696-477e-aee2-44fe18a595c9/13459418520-500.jpg',

    // --- Wings ---
    'WINGS': 'http://coverartarchive.org/release/cc613cb1-be50-4627-9ca5-68b09f58a8e4/14849913797-500.jpg',
    'Wings': 'http://coverartarchive.org/release/cc613cb1-be50-4627-9ca5-68b09f58a8e4/14849913797-500.jpg',
    // 'You Never Walk Alone' — not in Cover Art Archive

    // --- Japanese ---
    'YOUTH': 'http://coverartarchive.org/release/46e327cb-75dc-49ea-a85a-63d626df3aac/15126118120-500.jpg',
    'THE BEST OF 防彈少年團': 'http://coverartarchive.org/release/c3a623ae-9af1-4862-8fb6-60b4f198fb65/15425401643-500.jpg',

    // --- Love Yourself ---
    "LOVE YOURSELF 承 'Her'": 'http://coverartarchive.org/release/5f47c9ae-b213-43c3-9a32-2f656a57dc4b/17820984530-500.jpg',
    'Love Yourself: Her': 'http://coverartarchive.org/release/5f47c9ae-b213-43c3-9a32-2f656a57dc4b/17820984530-500.jpg',
    '血、汗、涙': 'http://coverartarchive.org/release/44fbb39d-7257-4717-a25f-ca0068f96f6c/17164986782-500.jpg',
    'Come Back Home': 'http://coverartarchive.org/release/a96681b0-ef4f-414b-8ea6-b54e575a2b77/17243668325-500.jpg',
    'MIC Drop (Steve Aoki remix)': 'http://coverartarchive.org/release/0624caed-e1b4-44b4-a9fd-0d8661734203/18399772046-500.jpg',
    'MIC Drop / DNA / Crystal Snow': 'http://coverartarchive.org/release/3ec8648c-0c15-4f0b-ae2f-884e8c2e7134/18591467748-500.jpg',
    'FACE YOURSELF': 'http://coverartarchive.org/release/3b51454e-1951-4138-a38d-61bec6bc5772/25521519068-500.jpg',
    "LOVE YOURSELF 轉 'Tear'": 'http://coverartarchive.org/release/a9af433d-8e96-4a43-aca2-99de8aa7f776/25521616714-500.jpg',
    'Love Yourself: Tear': 'http://coverartarchive.org/release/a9af433d-8e96-4a43-aca2-99de8aa7f776/25521616714-500.jpg',
    'FAKE LOVE (Rocking Vibe mix)': 'http://coverartarchive.org/release/5816176b-611e-423b-99c0-753713477a52/20077095821-500.jpg',
    "LOVE YOURSELF 結 'Answer'": 'http://coverartarchive.org/release/0e791714-b3e3-4daf-bb00-ac1926597cd7/20759834301-500.jpg',
    'Love Yourself: Answer': 'http://coverartarchive.org/release/0e791714-b3e3-4daf-bb00-ac1926597cd7/20759834301-500.jpg',
    'Waste It on Me': 'http://coverartarchive.org/release/1351115e-96ba-4467-bbf7-b254ea37b600/21988641046-500.jpg',
    'FAKE LOVE / Airplane pt.2': 'http://coverartarchive.org/release/081baa48-4942-49a7-afce-f081776374f7/24403600223-500.jpg',
    'Waste It on Me (W+W remix)': 'http://coverartarchive.org/release/3895146a-4fe2-415b-a1d4-93f9baa41b93/21983839808-500.jpg',
    'Waste It on Me (Slushii remix)': 'http://coverartarchive.org/release/46149a31-c429-4f39-8b7e-a165e961783e/21988103099-500.jpg',
    'Waste It on Me (Cheat Codes remix)': 'http://coverartarchive.org/release/7386570d-3d61-4bb9-a9f6-019467c357ee/21984087938-500.jpg',
    'Waste It on Me (Steve Aoki the Bold Tender Sneeze remix)': 'http://coverartarchive.org/release/7481bec8-fefe-4355-9cc7-6a1e1a6a6482/21987898177-500.jpg',

    // --- Map of the Soul ---
    'MAP OF THE SOUL : PERSONA': 'http://coverartarchive.org/release/c238e2a3-a1a3-4f79-bf55-e5a588aa3666/22755801286-500.jpg',
    'Map of the Soul: Persona': 'http://coverartarchive.org/release/c238e2a3-a1a3-4f79-bf55-e5a588aa3666/22755801286-500.jpg',
    'Dream Glow (BTS WORLD OST Part.1)': 'https://coverartarchive.org/release/32ec6de7-7677-407a-b698-e7f75520b54d/32443199791-500.jpg',
    'A Brand New Day': 'http://coverartarchive.org/release/5ca6a9cc-3665-44a9-aced-ed319e173cef/23300744505-500.jpg',
    'All Night (BTS World Original Soundtrack) (Pt. 3)': 'http://coverartarchive.org/release/e3fb2f6a-e279-4857-8d62-fe663fa809d3/38165107382-500.jpg',
    'BTS WORLD: Original Soundtrack': 'http://coverartarchive.org/release/66247c66-0969-42e4-940e-e14a255ffdc7/23441450320-500.jpg',
    'Lights / Boy With Luv': 'http://coverartarchive.org/release/1e6fab34-bfb9-4111-9fdd-94b1a4f96ab3/33096105482-500.jpg',
    'Euphoria (JUSEVA! Remix)': 'http://coverartarchive.org/release/bca2366e-125d-499d-8950-96f2cb7127e7/35862902694-500.jpg',
    'Make It Right': 'http://coverartarchive.org/release/630eea86-a7f9-400b-bee0-1a2b690b9d6d/24554933597-500.jpg',
    'Make It Right (EDM remix)': 'http://coverartarchive.org/release/f6b0b965-1fe5-48fa-b0ec-25f116aaa025/27953663901-500.jpg',
    'Make It Right (acoustic remix)': 'http://coverartarchive.org/release/545a026c-1fb9-4474-807f-35f7182ebdb8/27953603019-500.jpg',
    "SUGA's Interlude": 'http://coverartarchive.org/release/0823aa32-a489-49c4-bb8d-2ced298cb259/24812056837-500.jpg',
    'Black Swan': 'http://coverartarchive.org/release/19e763fa-93c2-4795-a469-6a125751de6f/25175232176-500.jpg',
    'MAP OF THE SOUL : 7': 'http://coverartarchive.org/release/bdf973ab-5a6b-452c-91c5-df0706526d71/25478145851-500.jpg',
    'Map of the Soul: 7': 'http://coverartarchive.org/release/bdf973ab-5a6b-452c-91c5-df0706526d71/25478145851-500.jpg',
    'Stay Gold': 'http://coverartarchive.org/release/d71cacab-af50-4f33-861d-e2b3b444ba92/26506251616-500.jpg',
    'MAP OF THE SOUL : 7 〜 THE JOURNEY 〜': 'http://coverartarchive.org/release/4df8c603-1309-4c06-8506-74fef1b2d8e8/26506298179-500.jpg',

    // --- 2020-2021 ---
    'Dynamite': 'http://coverartarchive.org/release/f4427ccd-140f-4bfa-8f3f-9ad24222e77a/27050641478-500.jpg',
    'IONIQ: I\'m on It': 'https://coverartarchive.org/release/45ac5fe4-d2b7-4b9b-b892-ae730236b05f/41427218281-500.jpg',
    'Savage Love (Laxed - Siren Beat)': 'http://coverartarchive.org/release/a36dd42d-c0cc-408e-82f1-f36fa14ab4b9/27420130963-500.jpg',
    'BE': 'http://coverartarchive.org/release/75622cd1-7bf0-497d-a2ad-76a1dcb5d578/27844283090-500.jpg',
    'Dynamite (Holiday remix)': 'http://coverartarchive.org/release/7a3dde3c-1a3b-456e-a6bc-e00bd44d530f/28035633453-500.jpg',
    'Film out': 'http://coverartarchive.org/release/c7dfd29b-2429-473a-924b-49e403f290cc/28978934555-500.jpg',
    'Butter': 'http://coverartarchive.org/release/732ae5b8-fe97-4075-ac80-555460de9c2c/30254061669-500.jpg',
    'Butter (Hotter remix)': 'http://coverartarchive.org/release/4906a1e4-6bea-484c-9f0c-6c53ab302322/29486354164-500.jpg',
    'Butter (Hotter, Sweeter, Cooler)': 'http://coverartarchive.org/release/80a75a1b-0860-4c35-8d3a-4b413b5736fe/29538284823-500.jpg',
    'BTS, THE BEST': 'http://coverartarchive.org/release/b2282c88-5bc3-4159-b6b2-b8988f728e04/29635605852-500.jpg',
    'Permission to Dance': 'http://coverartarchive.org/release/b26f10f3-7703-4790-9549-c8ad3dab3f46/29954987466-500.jpg',
    'My Universe': 'http://coverartarchive.org/release/b30e483a-45ea-4d68-b6ae-418a8779d73f/30494918732-500.jpg',
    'My Universe (instrumental)': 'https://coverartarchive.org/release/aedd0505-7f11-43f9-b851-f69d41ad62a8/43243378577-500.jpg',
    "My Universe (SUGA's remix)": 'http://coverartarchive.org/release/1e330024-7952-43ff-a315-c1de68998a9d/30704324778-500.jpg',
    'Butter (Holiday remix)': 'http://coverartarchive.org/release/674b8461-3e9b-4c0f-917f-2c23e685e55c/36988475110-500.jpg',

    // --- 2022+ ---
    'Yet to Come (The Most Beautiful Moment)': 'http://coverartarchive.org/release/d3789e36-6868-4602-b6ea-bcc49a9aa0e7/37326522976-500.jpg',
    'Proof': 'http://coverartarchive.org/release/18f3f673-ae29-4dda-b855-ef4830041663/32750960123-500.jpg',
    'bad decisions': 'https://coverartarchive.org/release/b341aa39-0460-4847-9e91-f024f3563277/34708418975-500.jpg',
    'Bad Decisions (Acoustic)': 'https://coverartarchive.org/release/eee53c5d-a5c2-4d82-9ebf-2b003ff72ab5/39844771173-500.jpg',
    'Yet to Come (Hyundai ver.)': 'http://coverartarchive.org/release/3a6407b1-7e65-4c05-be30-2ce1d0ba3f47/33654112267-500.jpg',
    'The Planet': 'http://coverartarchive.org/release/72ef24d0-e810-464b-906a-8316f7e7f3b0/35638544227-500.jpg',
    'Take Two': 'http://coverartarchive.org/release/47915090-9b99-4cfe-9326-92b40332c345/35879173466-500.jpg',
    'ARIRANG': 'https://coverartarchive.org/release/ef672e3a-6d58-4887-b8f7-2ec629d19139/44096800112-500.jpg',
};

export function getCoverArtUrl(albumTitle: string): string | null {
    return COVER_ART_MAP[albumTitle] ?? null;
}
