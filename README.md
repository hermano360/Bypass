# Bypass
Bypass Application

## Setup

- [Install mongodb](https://www.mongodb.com/download-center#community)
- Seed your environment by running these 3 commands:`
⋅⋅1.`node scripts/seed_danger_influence_locations.js`
..2.`node scripts/seed_danger_influence_weights.js`
..3.`node scripts/compute_danger_influence.js`

## Running

- Make sure your mongo database is up (`mongod --config /usr/local/etc/mongod.conf`)
