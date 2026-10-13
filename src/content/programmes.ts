// The programme list mirrors the course catalogue in the Moksha admin panel
// (same names, categories and delivery modes), so an enquiry from the website
// lines up with a course staff can enrol the student into.
//
// Fees, durations and timetables are deliberately not shown: they are managed
// in the admin panel and shared with each enquirer.

export type Mode = 'Studio' | 'Online' | 'Studio & Online';
export type Discipline = 'Yoga' | 'Pilates';

export interface Programme {
  slug: string;
  name: string;
  discipline: Discipline;
  /** Undefined = the studio has not published the delivery mode yet. */
  mode?: Mode;
  summary: string;
  forWhom: string;
}

export const regularClasses: Programme[] = [
  {
    slug: 'regular-studio-yoga',
    name: 'Regular Studio Yoga Classes',
    discipline: 'Yoga',
    mode: 'Studio',
    summary: 'A steady, guided practice in the studio — posture, breath and rest, taught in person, at an unhurried pace.',
    forWhom: 'For anyone who wants a regular practice with a teacher in the room.',
  },
  {
    slug: 'regular-yoga-online',
    name: 'Regular Yoga Classes',
    discipline: 'Yoga',
    mode: 'Online',
    summary: 'The same guided practice, live from wherever you are. Roll out a mat, join the session and practise with the group.',
    forWhom: 'For those who travel, live further away, or simply prefer to practise at home.',
  },
  {
    slug: 'advanced-yoga-online',
    name: 'Advanced Yoga Classes',
    discipline: 'Yoga',
    mode: 'Online',
    summary: 'A more demanding online practice for students who already have a foundation and want to build strength, depth and focus.',
    forWhom: 'For experienced practitioners ready for a stronger practice.',
  },
  {
    slug: 'pilates-online',
    name: 'Pilates Classes',
    discipline: 'Pilates',
    mode: 'Online',
    summary: 'Mat-based Pilates taught live online: controlled, precise movement that builds core strength, posture and mobility.',
    forWhom: 'For those who want strength and stability work they can do at home.',
  },
  {
    slug: 'regular-pilates',
    name: 'Regular Pilates Classes',
    discipline: 'Pilates',
    summary: 'Ongoing Pilates classes focused on core strength, alignment and balanced, efficient movement.',
    forWhom: 'For anyone who wants Pilates as a consistent part of their week.',
  },
];

export const teacherTraining: Programme[] = [
  {
    slug: '200-hour-yoga-teacher-training',
    name: '200-Hour Yoga Teacher Training',
    discipline: 'Yoga',
    summary: 'The foundational training: deepen your own practice and learn how to guide others through a class safely and clearly.',
    forWhom: 'For committed practitioners taking their first step towards teaching.',
  },
  {
    slug: '300-hour-advanced-yoga-teacher-training',
    name: '300-Hour Advanced Yoga Teacher Training',
    discipline: 'Yoga',
    summary: 'An advanced training that builds on a foundational course, refining both personal practice and teaching skill.',
    forWhom: 'For teachers and practitioners who have completed a foundational training.',
  },
  {
    slug: 'mat-pilates-level-1-teacher-training',
    name: 'Mat Pilates Level 1 Teacher Training',
    discipline: 'Pilates',
    mode: 'Studio & Online',
    summary: 'Learn the mat Pilates repertoire and how to teach it — offered both in the studio and online.',
    forWhom: 'For movement teachers and Pilates students who want to instruct mat classes.',
  },
  {
    slug: 'bala-yoga-teacher-training',
    name: 'Bala Yoga Teacher Training',
    discipline: 'Yoga',
    summary: 'A training in sharing yoga with children: how to make practice playful, safe and age-appropriate.',
    forWhom: 'For teachers, parents and educators who want to teach yoga to children.',
  },
  {
    slug: 'aerial-yoga-training',
    name: 'Aerial Yoga Training',
    discipline: 'Yoga',
    mode: 'Studio',
    summary: 'Hands-on training in aerial yoga, taught in the studio where the equipment and supervision are.',
    forWhom: 'For practitioners and teachers who want to explore and teach aerial practice.',
  },
];

export const allProgrammes = [...regularClasses, ...teacherTraining];
