import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('events', (table)=>{
        table.increments()
        table.integer('user_id').notNullable()
        table.string('text')
        table.string('name').notNullable()
        table.date('date').notNullable()
        table.string('method').notNullable()
        table.integer('amount').notNullable()
        table.foreign('user_id').references('users.id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('events')
}

