.PHONY: help run test

SUBDIRS := backend frontend

help:
	@echo "Available targets:"
	@echo "TODO: implement help target as wished here:"
	@echo "https://ad-wiki.informatik.uni-freiburg.de/teaching/Reproducibility"
	@echo "Todo: add lint, clean, run targets"

run:
	@echo "TODO: start the whole application by running the backend and frontend - in parallel!"

test:
	@for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir test || exit $$?; \
	done
