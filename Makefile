NAME := template
DC := docker-compose

all: up logs

up:
	[ -d db_data ] || mkdir db_data
	[ -d pgadmin ] || mkdir pgadmin
	$(DC) --project-name $(NAME) up --detach
logs:
	$(DC) --project-name $(NAME) logs --follow --tail=100
front.logs:
	$(DC) --project-name $(NAME) logs --follow front --tail=100
front.shell:
	$(DC) --project-name $(NAME) exec front sh
back.logs:
	$(DC) --project-name $(NAME) logs --follow back --tail=100
back.shell:
	$(DC) --project-name $(NAME) exec back sh
back.test:
	$(DC) --project-name $(NAME) exec back npm run test:watch
stop:
	$(DC) --project-name $(NAME) stop
down:
	$(DC) --project-name $(NAME) down
ps:
	$(DC) --project-name $(NAME) ps
clean:
	$(DC) --project-name $(NAME) down --rmi all --volumes
	sudo rm -fr ./db_data
	rm -fr ./pgadmin
	rm -fr ./back_src/dist
	rm -fr ./back_src/node_modules
	rm -fr ./front_src/dist
	rm -fr ./front_src/node_modules

