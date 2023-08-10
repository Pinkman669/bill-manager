import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('records', (table)=>{
        table.increments()
        table.integer('requestor_id').notNullable()
        table.integer('receiver_id').notNullable()
        table.integer('event_id').notNullable()
        table.integer('amount').notNullable()
        table.boolean('due').defaultTo(false)
        table.boolean('accepted')
        table.foreign('requestor_id').references('users.id')
        table.foreign('receiver_id').references('users.id')
        table.foreign('event_id').references('events.id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('records')
}

