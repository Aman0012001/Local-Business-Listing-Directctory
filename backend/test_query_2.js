const { DataSource } = require('typeorm');
const d = new DataSource({
    type: 'postgres',
    host: '66.33.22.240',
    port: 45505,
    username: 'postgres',
    password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
    database: 'railway',
    ssl: true,
});
d.initialize().then(async () => {
    try {
        const query = d.createQueryBuilder()
            .select('LOWER(log.normalized_keyword)', 'normalizedKeyword')
            .addSelect('COUNT(log.id)', 'count7d')
            .addSelect('COUNT(CASE WHEN log.searched_at >= :sevenDays THEN 1 END)', 'actual7d')
            .from('search_logs', 'log')
            .groupBy('LOWER(log.normalized_keyword)')
            .having('COUNT(CASE WHEN log.searched_at >= :sevenDays THEN 1 END) > 0')
            .setParameters({
                sevenDays: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            });
        
        const res = await query.getRawMany();
        console.log('Raw output:', res.slice(0, 5));
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}).catch(console.error);
