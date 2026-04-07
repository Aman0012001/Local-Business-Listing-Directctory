const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking user "sss"...');
    
    // Find user by partial match on email or fullName
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'sss', mode: 'insensitive' } },
                { fullName: { contains: 'sss', mode: 'insensitive' } }
            ]
        },
        include: {
            vendor: {
                include: {
                    activePlan: {
                        include: {
                            subscription: true
                        }
                    },
                    subscriptions: {
                        where: { status: 'active' },
                        include: { plan: true }
                    }
                }
            }
        }
    });

    if (!user) {
        console.log('User "sss" not found.');
        return;
    }

    console.log('User found:', user.email, 'Role:', user.role);
    if (user.vendor) {
        console.log('Vendor ID:', user.vendor.id);
        console.log('Active Plan:', user.vendor.activePlan ? {
            name: user.vendor.activePlan.name,
            type: user.vendor.activePlan.type,
            expiresAt: user.vendor.activePlan.expiresAt
        } : 'None');
        
        console.log('Active Subscriptions (Current):', user.vendor.subscriptions.map(s => ({
            id: s.id,
            status: s.status,
            endDate: s.endDate,
            plan: s.plan?.name,
            amount: s.amount
        })));
    } else {
        console.log('User has no vendor profile.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
