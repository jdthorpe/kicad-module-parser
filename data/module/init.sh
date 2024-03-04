cat repos.txt | while read url 
do
    # extract the repo name
    repo=$(echo $url | awk '{gsub(/^.*\.com\//,"")}1')
    # clone the repo
    git clone $url $repo
    # delelete everythinb but the pcb files
    find $repo -type f -not -name \*.kicad_mod -delete
done
# remove links and empty dirs 
find . -type l -delete
find . -type d -empty -delete