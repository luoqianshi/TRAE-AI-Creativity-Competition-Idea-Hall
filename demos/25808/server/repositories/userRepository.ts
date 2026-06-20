import { prisma } from '../db';

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  role: string;
  name: string;
}

export const userRepository = {
  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: CreateUserInput) {
    return prisma.user.create({ data });
  },

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },
};
