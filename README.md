# PawConnect ALL In One Animal Welfare Platform

PawConnect is an AI-assisted animal welfare platform for coordinating rescue, adoption, veterinary care, lost-and-found reports, and shared animal records.

## Included MVP....

- Live care-pulse dashboard with active SOS, adoption, vet, and report metrics
- Emergency SOS intake and response board
- Adoption browsing with search and species filters
- Lost-and-found report creation and filtering
- Nearby vet directory with appointment booking
- Basic animal-care assistant with emergency escalation guidance
- Animal digital profiles with vaccination records and edit flow
- PostgreSQL persistence through Drizzle ORM

## Local development...

1. Install dependencies with pnpm.
2. Set DATABASE_URL and SESSION_SECRET in the environment.
3. Push the development schema with pnpm --filter @workspace/db run push.
4. Start the API server and PawConnect web app using the configured workflows.

The frontend is served at the root preview path and the API is available under /api.


