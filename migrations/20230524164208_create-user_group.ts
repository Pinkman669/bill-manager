import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user_group', (table)=>{
        table.increments()
        table.integer('group_id').notNullable()
        table.integer('user_id').notNullable()
        table.foreign('group_id').references('groups.id')
        table.foreign('user_id').references('users.id')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('user_group')
}

