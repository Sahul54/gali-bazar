
// import { prisma } from "../../lib/prisma.js";

// export const authRepository = {
//   // Save a new OTP verification record
//   async createOtp({ phone, otpHash, expiresAt }) {
//     return prisma.otpVerification.create({
//       data: {
//         phone,
//         otpHash,
//         expiresAt,
//       },
//     });
//   },

//   // Find the latest unverified OTP for a phone number
//   async findLatestOtp(phone) {
//     return prisma.otpVerification.findFirst({
//       where: {
//         phone,
//         verifiedAt: null,
//         expiresAt: {
//           gt: new Date(),
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//   },

  
//   // Find the latest OTP request, including expired or verified OTPs
//   async findLatestOtpRequest(phone) {
//     return prisma.otpVerification.findFirst({
//       where: {
//         phone,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       select: {
//         createdAt: true,
//       },
//     });
//   },



//   // Atomically increment attempts only while the limit has not been reached
//   async incrementOtpAttempts(id, maxAttempts) {
//     return prisma.otpVerification.updateMany({
//       where: {
//         id,
//         attempts: {
//           lt: maxAttempts,
//         },
//         verifiedAt: null,
//         expiresAt: {
//           gt: new Date(),
//         },
//       },
//       data: {
//         attempts: {
//           increment: 1,
//         },
//       },
//     });
//   },



//   // Atomically mark an OTP as verified only if it is still valid and unused
//   async markOtpVerified(id) {
//     return prisma.otpVerification.updateMany({
//       where: {
//         id,
//         verifiedAt: null,
//         expiresAt: {
//           gt: new Date(),
//         },
//       },
//       data: {
//         verifiedAt: new Date(),
//       },
//     });
//   },


//   // Find a user by phone number
//   async findUserByPhone(phone) {
//     return prisma.user.findUnique({
//       where: { phone },
//     });
//   },

//   // Create a customer if one doesn't already exist
//   async findOrCreateCustomer(phone) {
//     return prisma.user.upsert({
//       where: { phone },
//       update: {},
//       create: {
//         phone,
//         role: "CUSTOMER",
//       },
//     });
//   },
// };



import { prisma } from "../../lib/prisma.js";

export const authRepository = {
  // Save a new OTP verification record
  async createOtp({ phone, otpHash, expiresAt }) {
    return prisma.otpVerification.create({
      data: {
        phone,
        otpHash,
        expiresAt,
      },
    });
  },

  // Find the latest unverified, unexpired OTP
  async findLatestOtp(phone) {
    return prisma.otpVerification.findFirst({
      where: {
        phone,
        verifiedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Find the latest OTP request for resend cooldown
  async findLatestOtpRequest(phone) {
    return prisma.otpVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
  },

  // Increment attempts only while below the maximum
  async incrementOtpAttempts(id, maxAttempts) {
    return prisma.otpVerification.updateMany({
      where: {
        id,
        attempts: { lt: maxAttempts },
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        attempts: { increment: 1 },
      },
    });
  },

  // Mark OTP as verified only if it is still valid and unused
  async markOtpVerified(id) {
    return prisma.otpVerification.updateMany({
      where: {
        id,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        verifiedAt: new Date(),
      },
    });
  },

  // Find a user by phone number
  async findUserByPhone(phone) {
    return prisma.user.findUnique({
      where: { phone },
    });
  },
};
