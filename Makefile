help:
	@echo "Not implemented yet"
all: clean compile test checkstyle run

%:
	@echo -e "\e[1;30;103m+ $@\e[0m"
	@for i in server,$(MAKE); do \
	  IFS=","; set -- $$i; echo -e "\e[1;93;100m$$1\e[0m"; \
	  cd $$1; $$2 $@; cd ..; \
	done
	@echo -e "\e[1;30;103m- $@\e[0m"