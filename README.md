# InstaGraph - Instagram Growth Assistant

Instagram-ის ზრდის ასისტენტი, რომელიც ააგებს ანალიტიკას და მის საფუძველზე გირჩევს რა ქნეს, რა დაწერო და როდის გამოაქვეყნოს, რომ გამომწერები და ჩართულობა გაიზარდოს.

## ძირითადი ფუნქციები

### MVP (ფაზა 1)
1. **ანალიტიკა** - Official Instagram Graph API-ზე დაფუძნებული
   - ანგარიშის ჯანმრთელობა: Reach, Impressions, Followers Δ, Profile Visits
   - კონტენტის ქულა თითო პოსტზე: ER, ჩართულობის მეტრიკები
   - საუკეთესო პოსტების ანალიზი

2. **AI რჩევები**
   - "What to post next" - 5 იდეა შენი ნიშიდან
   - სათაურები + აღწერები ქართულად/ინგლისურად
   - ჰეშთეგების გენერატორი
   - საუკეთესო დრო გამოქვეყნებისთვის

3. **დაგეგმვა და A/B**
   - კონტენტის კალენდარი
   - A/B Caption Test
   - რემაინდერები

### Pro მოდული (ფაზა 2)
- კონკურენტების შედარება
- კომენტარების სენტიმენტი
- Brand consistency checker
- Campaign goals

## ტექნოლოგიები

- **Frontend**: Next.js (App Router), Tailwind, shadcn/ui
- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL + Redis
- **AI**: GPT-კლასი მოდელი + RAG
- **Auth**: Meta OAuth + Instagram Business Account

## გაშვება

### Docker-ით (რეკომენდებული)

```bash
# მთელი სისტემის გაშვება
docker-compose up -d

# ლოგების ნახვა
docker-compose logs -f

# გაჩერება
docker-compose down
```

### Manual გაშვება

```bash
# Root დირექტორიაში dependencies-ის ინსტალაცია
npm run install:all

# Database-ის გაშვება (PostgreSQL და Redis საჭიროა)
# მერე:
npm run dev
```

### Environment Variables

Backend-ისთვის შექმენით `.env` ფაილი `env.example`-ის მიხედვით:

```bash
cp backend/env.example backend/.env
```

აუცილებელი კონფიგურაციები:
- `FACEBOOK_APP_ID` - Facebook App ID
- `FACEBOOK_APP_SECRET` - Facebook App Secret  
- `OPENAI_API_KEY` - OpenAI API Key (AI რეკომენდაციებისთვის)
- `JWT_SECRET` - JWT Secret Key

## პროექტის სტრუქტურა

```
instagraph/
├── frontend/          # Next.js აპლიკაცია
├── backend/           # NestJS API
├── database/          # PostgreSQL schemas
├── docs/             # დოკუმენტაცია
└── scripts/          # დამხმარე სკრიპტები
```

## Roadmap

- **კვირა 1**: Meta OAuth, ინსაიტების ქაჩვა, მინიმალური დეშბორდი
- **კვირა 2**: Content Scoring, AI რეკომენდაციები
- **კვირა 3**: კალენდარი, A/B testing
- **კვირა 4**: Polish და ბეტა გაშვება
