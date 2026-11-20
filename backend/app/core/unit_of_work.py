from app.core.database import session_factory


class UnitOfWork:
    def __init__(self, factory=session_factory):
        self.session_factory = factory

    def __enter__(self):
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type:
                self.session.rollback()
            else:
                try:
                    self.session.commit()
                except Exception:
                    self.session.rollback()
                    raise
        finally:
            self.session.close()
        return False
