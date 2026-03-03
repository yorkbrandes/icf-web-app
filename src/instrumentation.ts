export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("./lib/db");
    const { hash } = await import("bcrypt");

    const bossEmail = process.env.BOSS_EMAIL;
    const bossPassword = process.env.BOSS_PASSWORD;

    if (!bossEmail || !bossPassword) {
      console.warn(
        "[instrumentation] BOSS_EMAIL or BOSS_PASSWORD not set. Skipping boss seeding."
      );
      return;
    }

    try {
      const existingBoss = await prisma.boss.findUnique({
        where: { email: bossEmail },
      });

      if (!existingBoss) {
        const hashedPassword = await hash(bossPassword, 12);
        await prisma.boss.create({
          data: {
            email: bossEmail,
            password: hashedPassword,
          },
        });
        console.log(`[instrumentation] Boss account created for ${bossEmail}`);
      }
    } catch (error) {
      console.error("[instrumentation] Failed to seed boss account:", error);
    }
  }
}
