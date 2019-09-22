from django import forms

OPTIONS = [
    ('1', 'Has keyword'),
    ('2', 'From user')
]

class SearchForm(forms.Form):
    searchinput = forms.CharField()
    option = forms.IntegerField(widget=forms.RadioSelect(choices=OPTIONS))