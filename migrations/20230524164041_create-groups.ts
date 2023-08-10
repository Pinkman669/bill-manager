import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('groups', (table)=>{
        table.increments()
        table.integer('creator_id').notNullable()
        table.string('name').notNullable()
        table.foreign('creator_id').references('users.id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('groups')
}

