import fastify from 'fastify';

const app = fastify({ logger: true });

app.listen({ host: '0.0.0.0', port: 3000 });
