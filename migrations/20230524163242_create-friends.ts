import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('friends', (table)=>{
        table.increments()
        table.integer('user1_id').notNullable()
        table.integer('user2_id').notNullable()
        table.foreign('user1_id').references('users.id')
        table.foreign('user2_id').references('users.id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('friends')
}

