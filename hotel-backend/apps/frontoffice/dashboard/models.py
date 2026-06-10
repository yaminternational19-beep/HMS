from django.db import models

class FrontofficeAlert(models.Model):
    title = models.CharField(max_length=255)
    desc = models.TextField()
    type = models.CharField(max_length=50, default='info')
    related_model = models.CharField(max_length=100, blank=True, null=True)
    related_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
