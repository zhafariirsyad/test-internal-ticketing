import 'dotenv/config';
import {
  PrismaClient,
  Role,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Admin Example',
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      name: 'Admin Example',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@example.com' },
    update: {
      name: 'Admin Example 2',
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      name: 'Admin Example 2',
      email: 'admin2@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      name: 'User Example',
      password: hashedPassword,
      role: Role.USER,
    },
    create: {
      name: 'User Example',
      email: 'user@example.com',
      password: hashedPassword,
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {
      name: 'User Example 2',
      password: hashedPassword,
      role: Role.USER,
    },
    create: {
      name: 'User Example 2',
      email: 'user2@example.com',
      password: hashedPassword,
      role: Role.USER,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'user3@example.com' },
    update: {
      name: 'User Example 3',
      password: hashedPassword,
      role: Role.USER,
    },
    create: {
      name: 'User Example 3',
      email: 'user3@example.com',
      password: hashedPassword,
      role: Role.USER,
    },
  });

  await prisma.ticketComment.deleteMany();
  await prisma.ticketActivity.deleteMany();
  await prisma.ticket.deleteMany();

  const tickets = [
    {
      title: 'Laptop tidak bisa connect wifi',
      category: TicketCategory.NETWORK,
      priority: TicketPriority.HIGH,
      description: 'Laptop tidak bisa terhubung ke wifi kantor sejak pagi.',
      status: TicketStatus.IN_PROGRESS,
      createdById: user1.id,
      assignedToId: admin1.id,
      comments: [
        {
          userId: user1.id,
          comment: 'Sudah coba reconnect beberapa kali tapi belum bisa.',
        },
        {
          userId: admin1.id,
          comment: 'Sedang dicek konfigurasi adapter dan profil wifi-nya.',
        },
      ],
      activities: [
        {
          userId: user1.id,
          activity: 'User User Example membuat ticket baru',
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: admin1.id,
          activity: 'Admin mengubah status dari OPEN menjadi IN_PROGRESS',
          oldStatus: TicketStatus.OPEN,
          newStatus: TicketStatus.IN_PROGRESS,
        },
      ],
    },
    {
      title: 'Reset password email kantor',
      category: TicketCategory.ACCOUNT,
      priority: TicketPriority.MEDIUM,
      description: 'Tidak bisa login email kantor dan perlu reset password.',
      status: TicketStatus.DONE,
      createdById: user2.id,
      assignedToId: admin2.id,
      comments: [
        {
          userId: admin2.id,
          comment: 'Password sudah direset, silakan coba login kembali.',
        },
      ],
      activities: [
        {
          userId: user2.id,
          activity: 'User User Example 2 membuat ticket baru',
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: admin2.id,
          activity: 'Admin mengubah status dari OPEN menjadi DONE',
          oldStatus: TicketStatus.OPEN,
          newStatus: TicketStatus.DONE,
        },
      ],
    },
    {
      title: 'Printer ruangan finance error',
      category: TicketCategory.HARDWARE,
      priority: TicketPriority.LOW,
      description: 'Printer menampilkan error paper jam padahal tidak ada kertas tersangkut.',
      status: TicketStatus.OPEN,
      createdById: user3.id,
      assignedToId: null,
      comments: [],
      activities: [
        {
          userId: user3.id,
          activity: 'User User Example 3 membuat ticket baru',
          newStatus: TicketStatus.OPEN,
        },
      ],
    },
    {
      title: 'Aplikasi payroll tidak bisa login',
      category: TicketCategory.SOFTWARE,
      priority: TicketPriority.HIGH,
      description: 'Setelah update terbaru, aplikasi payroll menolak login user.',
      status: TicketStatus.REJECTED,
      createdById: user1.id,
      assignedToId: admin2.id,
      comments: [
        {
          userId: admin2.id,
          comment: 'Issue tidak dapat direproduksi, kemungkinan user salah environment.',
        },
      ],
      activities: [
        {
          userId: user1.id,
          activity: 'User User Example membuat ticket baru',
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: admin2.id,
          activity: 'Admin mengubah status dari OPEN menjadi REJECTED',
          oldStatus: TicketStatus.OPEN,
          newStatus: TicketStatus.REJECTED,
        },
      ],
    },
    {
      title: 'VPN kantor sering putus-putus',
      category: TicketCategory.NETWORK,
      priority: TicketPriority.MEDIUM,
      description: 'Koneksi VPN terputus setiap 10-15 menit saat kerja remote.',
      status: TicketStatus.IN_PROGRESS,
      createdById: user2.id,
      assignedToId: admin1.id,
      comments: [
        {
          userId: user2.id,
          comment: 'Sudah coba ganti jaringan rumah dan hasilnya sama.',
        },
      ],
      activities: [
        {
          userId: user2.id,
          activity: 'User User Example 2 membuat ticket baru',
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: admin1.id,
          activity: 'Admin mengubah status dari OPEN menjadi IN_PROGRESS',
          oldStatus: TicketStatus.OPEN,
          newStatus: TicketStatus.IN_PROGRESS,
        },
      ],
    },
    {
      title: 'Mouse wireless tidak terdeteksi',
      category: TicketCategory.HARDWARE,
      priority: TicketPriority.LOW,
      description: 'Mouse wireless tidak terdeteksi setelah laptop restart.',
      status: TicketStatus.DONE,
      createdById: user3.id,
      assignedToId: admin1.id,
      comments: [
        {
          userId: admin1.id,
          comment: 'Dongle dipasang ulang dan device sudah kembali normal.',
        },
      ],
      activities: [
        {
          userId: user3.id,
          activity: 'User User Example 3 membuat ticket baru',
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: admin1.id,
          activity: 'Admin mengubah status dari OPEN menjadi DONE',
          oldStatus: TicketStatus.OPEN,
          newStatus: TicketStatus.DONE,
        },
      ],
    },
  ];

  for (const ticket of tickets) {
    await prisma.ticket.create({
      data: {
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        description: ticket.description,
        status: ticket.status,
        createdById: ticket.createdById,
        assignedToId: ticket.assignedToId,
        comments: {
          create: ticket.comments,
        },
        activities: {
          create: ticket.activities,
        },
      },
    });
  }

  console.log('Seed selesai');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
