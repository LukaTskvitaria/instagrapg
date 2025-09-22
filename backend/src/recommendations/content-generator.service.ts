import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ContentIdea {
  title: string;
  hooks: string[];
  scenario: string;
  contentType: 'REEL' | 'CAROUSEL' | 'SINGLE_IMAGE';
  captions: {
    georgian: string;
    english: string;
    tone: 'informative' | 'friendly' | 'promotional';
  }[];
  hashtags: {
    core: string[];
    niche: string[];
    rotating: string[];
  };
  callToAction: string;
}

@Injectable()
export class ContentGeneratorService {
  private readonly logger = new Logger(ContentGeneratorService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async generateContentIdeas(
    niche: string,
    recentPostsPerformance: any[],
    audienceLanguages: string[] = ['ka', 'en'],
    brandTone: string = 'friendly',
    count: number = 5,
  ): Promise<ContentIdea[]> {
    try {
      const prompt = this.buildContentPrompt(
        niche,
        recentPostsPerformance,
        audienceLanguages,
        brandTone,
        count,
      );

      const openaiResponse = await this.callOpenAI(prompt);
      return this.parseContentIdeas(openaiResponse);
    } catch (error) {
      this.logger.error('Failed to generate content ideas', error.stack);
      return this.getFallbackContentIdeas(niche);
    }
  }

  private buildContentPrompt(
    niche: string,
    recentPosts: any[],
    languages: string[],
    tone: string,
    count: number,
  ): string {
    const performanceAnalysis = recentPosts.length > 0 
      ? `ბოლო პოსტების ანალიზი:
${recentPosts.map(post => 
  `- ${post.mediaType}: ER ${post.engagementRate}%, Reach: ${post.reach}, Likes: ${post.likes}`
).join('\n')}`
      : '';

    return `
შენ ხარ Instagram Growth Expert, რომელიც ეხმარება ქართულ ბიზნესებს Instagram-ზე ზრდაში.

ნიშა: ${niche}
ბრენდის ტონი: ${tone}
ენები: ${languages.includes('ka') ? 'ქართული' : ''} ${languages.includes('en') ? 'ინგლისური' : ''}

${performanceAnalysis}

გთხოვ შექმნა ${count} კონტენტის იდეა რომელიც:
1. შეესაბამება ამ ნიშას
2. გაითვალისწინებს ბოლო პოსტების შედეგებს
3. იყოს ჩართვადი და ღირებულებიანი

თითოეული იდეისთვის მომეცი:
- სათაური
- 3 ჰუკის ვარიანტი (პირველი 3-5 სიტყვა)
- მოკლე სცენარი Reel/Carousel-ისთვის
- კონტენტის ტიპი (REEL/CAROUSEL/SINGLE_IMAGE)
- 2 Caption ვარიანტი (ერთი ინფორმაციული, ერთი მეგობრული)
- ჰეშთეგები: 5 core + 7 niche + 3 rotating
- Call-to-Action

გამოიყენე JSON ფორმატი.
`;
  }

  private async callOpenAI(prompt: string): Promise<any> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4'),
          messages: [
            {
              role: 'system',
              content: 'შენ ხარ Instagram Growth Expert რომელიც ქართულ ბაზარს იცნობს და ეხმარება ბიზნესებს Instagram-ზე ზრდაში.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data.choices[0].message.content;
  }

  private parseContentIdeas(aiResponse: string): ContentIdea[] {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [parsed];
    } catch (error) {
      // If JSON parsing fails, use fallback
      this.logger.warn('Failed to parse AI response as JSON', error.message);
      return this.getFallbackContentIdeas();
    }
  }

  private getFallbackContentIdeas(niche: string = 'ზოგადი'): ContentIdea[] {
    return [
      {
        title: 'დღის რჩევა',
        hooks: ['გსურს იცოდე...', 'ეს რჩევა შეცვლის...', '3 წუთში ისწავლე...'],
        scenario: 'მოკლე ვიდეო სასარგებლო რჩევით',
        contentType: 'REEL',
        captions: [
          {
            georgian: 'დღეს გაგიზიარებთ მნიშვნელოვან რჩევას რომელიც დაგეხმარებათ...',
            english: 'Today I\'m sharing an important tip that will help you...',
            tone: 'informative',
          },
          {
            georgian: 'ჰეი! 👋 რა ფიქრობთ ამ რჩევაზე? კომენტარებში მიწერეთ...',
            english: 'Hey! 👋 What do you think about this tip? Let me know in the comments...',
            tone: 'friendly',
          },
        ],
        hashtags: {
          core: ['#რჩევა', '#tip', '#ცოდნა', '#knowledge', '#გაზიარება'],
          niche: [`#${niche}`, '#ბიზნესი', '#business', '#წარმატება', '#success', '#სწავლა', '#learning'],
          rotating: ['#დღესდღეობით', '#today', '#ახალი'],
        },
        callToAction: 'შეინახე ეს პოსტი და გაუზიარე მეგობრებს!',
      },
      {
        title: 'შეცდომები რომლებიც უნდა თავიდან იქნას აცილებული',
        hooks: ['ეს შეცდომები კლავს...', 'არასოდეს გააკეთო ეს...', 'TOP 5 შეცდომა...'],
        scenario: 'Carousel პოსტი 5-7 სლაიდით',
        contentType: 'CAROUSEL',
        captions: [
          {
            georgian: 'ყველაზე გავრცელებული შეცდომები რომლებიც ხშირად ვხედავ...',
            english: 'The most common mistakes I often see...',
            tone: 'informative',
          },
          {
            georgian: 'ოუ არა! 🤦‍♀️ ეს შეცდომები ნამდვილად მტკივნეულია... შენც ხომ არ აკეთებ ასეთ რამეს?',
            english: 'Oh no! 🤦‍♀️ These mistakes are really painful... Are you making these too?',
            tone: 'friendly',
          },
        ],
        hashtags: {
          core: ['#შეცდომები', '#mistakes', '#რჩევები', '#tips', '#სწავლა'],
          niche: [`#${niche}`, '#ბიზნესი', '#business', '#გამოცდილება', '#experience', '#წარმატება'],
          rotating: ['#ყურადღება', '#attention', '#მნიშვნელოვანი'],
        },
        callToAction: 'რომელი შეცდომა იყო ყველაზე გასაკვირი? 👇',
      },
    ];
  }

  async generateHashtags(
    niche: string,
    contentTopic: string,
    language: string = 'ka',
  ): Promise<{ core: string[]; niche: string[]; rotating: string[] }> {
    const prompt = `
გენერირება ჰეშთეგების Instagram-ისთვის:
ნიშა: ${niche}
თემა: ${contentTopic}
ენა: ${language === 'ka' ? 'ქართული' : 'ინგლისური'}

მომეცი:
- 5 core ჰეშთეგი (ძირითადი, ყოველთვის გამოსაყენებელი)
- 7 niche ჰეშთეგი (სპეციფიკური ამ ნიშისთვის)
- 3 rotating ჰეშთეგი (ტრენდული, დროებითი)

JSON ფორმატში დააბრუნე.
`;

    try {
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      this.logger.warn('Failed to generate hashtags', error.message);
      return this.getFallbackHashtags(niche, language);
    }
  }

  private getFallbackHashtags(niche: string, language: string): { core: string[]; niche: string[]; rotating: string[] } {
    if (language === 'ka') {
      return {
        core: ['#ქართული', '#საქართველო', '#ბიზნესი', '#წარმატება', '#რჩევები'],
        niche: [`#${niche}`, '#სწავლა', '#განვითარება', '#მოტივაცია', '#ცოდნა', '#გამოცდილება', '#ინოვაცია'],
        rotating: ['#დღესდღეობით', '#ახალი', '#ტრენდი'],
      };
    }

    return {
      core: ['#business', '#success', '#tips', '#motivation', '#growth'],
      niche: [`#${niche.toLowerCase()}`, '#entrepreneur', '#startup', '#innovation', '#strategy', '#leadership', '#development'],
      rotating: ['#trending', '#new', '#today'],
    };
  }
}
