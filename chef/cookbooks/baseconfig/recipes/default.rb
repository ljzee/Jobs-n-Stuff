# Make sure the Apt package lists are up to date, so we're downloading versions that exist.
cookbook_file "apt-sources.list" do
  path "/etc/apt/sources.list"
end
execute 'apt_update' do
  command 'apt-get update'
end
execute 'apt_upgrade' do
  command 'apt-get upgrade -y'
end

# Base configuration recipe in Chef.
package "wget"
package "ntp"

cookbook_file "ntp.conf" do
  path "/etc/ntp.conf"
end
execute 'ntp_restart' do
  command 'service ntp restart'
end

execute 'get newest nodejs' do
  command 'curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -'
end

execute 'install nodejs' do
  command 'apt-get install -y nodejs'
end

execute 'install build-essential' do
  command 'apt-get install -y build-essential'
end

execute 'install docker pre-requisites' do
  command 'apt install -y apt-transport-https ca-certificates curl software-properties-common'
end

execute 'get docker key' do
  command 'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -'
end

execute 'set up stable docker repo' do
  command 'add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"'
end

execute 'install docker' do
  command 'apt-get install -y docker-ce docker-compose'
end

execute 'install imagemagick' do
  command 'apt-get -y install imagemagick'
end

execute 'npm configuration' do
  command 'npm config set unsafe-perm true'
end

execute 'global packages' do
  command 'npm i -g prisma graphql-cli create-react-app dotenv'
end

execute 'resolve global ajv dependency' do
  command 'npx install-peerdeps ajv-keywords'
  cwd '/usr/lib/node_modules'
end

execute 'server npm packages' do
  command 'npm install'
  cwd '/home/vagrant/project/server'
end

execute 'project npm packages' do
  command 'npm install'
  cwd '/home/vagrant/project'
end

execute 'resolve project ajv dependency' do
  command 'npx install-peerdeps ajv-keywords'
  cwd '/home/vagrant/project'
end

execute 'start docker' do
  command 'docker-compose up -d'
  cwd '/home/vagrant/project/server'
end

execute 'sleep before prisma deploy' do
  command 'sleep 10'
end

execute 'prisma deploy' do
  command 'prisma deploy --env-file .env'
  cwd '/home/vagrant/project/server'
end

# execute 'graphql server' do
#   command 'npm start > /dev/null &'
#   cwd '/home/vagrant/project/server'
# end

# execute 'apollo server' do
#   command 'npm start > /dev/null &'
#   cwd '/home/vagrant/project'
# end
