import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("users", (table)=>{
        table.increments()
        table.string("email").notNullable()
        table.string('password').notNullable()
        table.string('nickname').notNullable()
        table.string('image')
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}

