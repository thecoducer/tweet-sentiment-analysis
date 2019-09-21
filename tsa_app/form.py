from django import forms

OPTIONS = [
    ('1', 'Has keyword'),
    ('2', 'From user')
]

class SearchForm(forms.Form):
    search_input = forms.CharField()
    option = forms.IntegerField(widget=forms.RadioSelect(choices=OPTIONS))